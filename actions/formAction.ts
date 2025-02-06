"use server";
import {
  createProject,
  assignUserToProject,
  deleteProject,
  getProjectsByUserId,
  getUnassignedProjects,
} from "@/data/work-time";
import { currentUser } from "@/lib/auth";
import { addDays, differenceInCalendarDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { FormActionResult } from '@/models/form-action-result';
import { generateWithOllama } from '@/lib/ai';
import { Project } from "@prisma/client";

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

const assignUserToProjectAction = async (_prevResult: FormActionResult, formData: FormData) : Promise<FormActionResult> => {
  const userId = formData.get("userId")?.toString();
  const projectId = formData.get("projectId")?.toString();
  if (!userId || !projectId) {  
    return { error: "User and project are required" };
  }
  await assignUserToProject(userId, projectId);
  revalidatePath("/dashboard");
  return { success: "User assigned to project successfully" };
}

const getAssignableProjectsAction = async (_prevResult: Project[], userId: string) => {
  const assignableProjects: Project[] = await getUnassignedProjects(userId);
  return assignableProjects;
};

export { deleteAllProjectAndWorkTimeReport, generateOllamaAction, createProjectAction, assignUserToProjectAction, getAssignableProjectsAction };
