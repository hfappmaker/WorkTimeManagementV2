"use server";
import {
  createProject,
  createWorkTime,
  createWorkTimeReport,
  deleteProject,
  getProjectsByUserId,
} from "@/data/work-time";
import { currentUser } from "@/lib/auth";
import { addDays, differenceInCalendarDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { FormActionResult } from '@/models/form-action-result';
import { generateWithOllama } from '@/lib/ai';

const generateOllamaAction = async (_prevResult: FormActionResult, formData: FormData) => {
  const prompt = formData.get("deepSeekPrompt")?.toString();
  if (!prompt) {
    return { error: "Prompt is required" };
  }

  const aiModel = formData.get("aiModel")?.toString();
  if (!aiModel) {
    return { error: "AI model selection is required" };
  }
  
  const config = {
    model: aiModel,
    temperature: 0.7,
    max_tokens: 2048
  };

  const worktime_prompt = `以下の文章から、各日の出勤（開始時刻）と退勤（終了時刻）の情報を抽出してください。
  ${prompt}
抽出した情報を、以下の JSON 配列形式で出力してください。
※ 数字が1桁の場合はゼロパディングしてください（例：1月 → 01、9時 → 09:00）。
※ 各日付の情報は、以下の形式のJSONオブジェクトにしてください。
※ 必要に応じて、西暦（例: 2025）を設定してください。
形式:
[
{
startTime: 'yyyy/MM/DD HH:mm',
endTime: 'yyyy/MM/DD HH:mm'
},
{
startTime: 'yyyy/MM/DD HH:mm',
endTime: 'yyyy/MM/DD HH:mm'
},
...
]
例:
入力: 「1月2日は9時出勤、18時退勤。1月3日は10時出勤、19時退勤」
出力:
[
{ startTime: '2025/01/02 09:00', endTime: '2025/01/02 18:00' },
{ startTime: '2025/01/03 10:00', endTime: '2025/01/03 19:00' }
]
【注意】
・出力は必ず上記の JSON 配列形式で行ってください。
・余計な説明文やコメントは出力に含めないでください。
・月、日、時、分が1桁の場合でも、必ず2桁に変換してください。
`;

  return await generateWithOllama(worktime_prompt, config);
}

const deleteAllProjectAndWorkTimeReport = async (_prevResult: FormActionResult, _formData: FormData) => {
  const user = await currentUser();
  const projects = await getProjectsByUserId(user.id);
  for (var project of projects) {
    await deleteProject(project.id);
  }
  revalidatePath("/dashboard");
  return { success: "All projects deleted successfully" };
}

const createProjectAndWorkTimeReport = async (_prevResult: FormActionResult, formData: FormData) => {
  var newProjectName = formData.get("newProjectName")?.toString();
  if (!newProjectName) {
    return { error: "Project name is required" };
  }
  var startDate = new Date();
  const user = await currentUser();
  var project = await createProject(newProjectName, startDate, null);
  var endDate = addDays(startDate, 30);
  var workTimeReport = await createWorkTimeReport(
    user.id,
    project.id,
    startDate,
    endDate
  );
  const daysInPeriod = differenceInCalendarDays(endDate, startDate) + 1;
  const datesInPeriod = Array.from({ length: daysInPeriod }, (_, i) =>
    addDays(startDate, i)
  );
  for (var date of datesInPeriod) {
    await createWorkTime(date, date, workTimeReport.id);
  }
  
  revalidatePath("/dashboard");
  return { success: "Project created successfully" };
};

export { createProjectAndWorkTimeReport, deleteAllProjectAndWorkTimeReport, generateOllamaAction };
