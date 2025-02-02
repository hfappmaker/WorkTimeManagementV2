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

const generateOllamaAction = async (_prevResult: FormActionResult, formData: FormData) : Promise<FormActionResult> => {
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

  return await generateWithOllama(prompt, config);
}

const deleteAllProjectAndWorkTimeReport = async (_prevResult: FormActionResult, _formData: FormData) : Promise<FormActionResult> => {
  const user = await currentUser();
  const projects = await getProjectsByUserId(user.id);
  for (var project of projects) {
    await deleteProject(project.id);
  }
  revalidatePath("/dashboard");
  return { success: "All projects deleted successfully" };
}

const createProjectAndWorkTimeReport = async (_prevResult: FormActionResult, formData: FormData) : Promise<FormActionResult> => {
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

const createProjectAction = async (_prevResult: FormActionResult, formData: FormData) : Promise<FormActionResult> => {
  const projectName = formData.get('projectName') as string;
  const startDateStr = formData.get('startDate') as string;
  
  if (!projectName || projectName.trim() === "") {
    return { error: "Project name is required" };
  }
  if (!startDateStr) {
    return { error: "Start date is required" };
  }
  
  // 入力された開始日を Date 型に変換
  const startDate = new Date(startDateStr);
  
  console.log('Creating project:', projectName, 'with start date:', startDate);
  
  // DB にプロジェクトを登録（endDate は null とするか、必要に応じて別途設定）
  const project = await createProject(projectName, startDate, null);
  
  // キャッシュ再検証を実行（適切なパスに変更してください）
  revalidatePath('/dashboard');
  
  return { success: `Project '${projectName}' created successfully` };
}

export { createProjectAndWorkTimeReport, deleteAllProjectAndWorkTimeReport, generateOllamaAction, createProjectAction };
