"use server";

import {
  createProject,
  assignUserToProject,
  getUnassignedProjects,
  unassignUserFromProject,
  getAssignedProjects,
  deleteProject,
  searchProjects,
  updateProject,
  getProjectById,
} from "@/data/work-time";
import { revalidatePath } from "next/cache";
import { FormActionResult } from '@/models/form-action-result';
import { generateWithOllama } from '@/lib/ai';
import { Project } from "@prisma/client";

function getFormDataValue(formData: FormData, key: string): string {
  return formData.get(key)?.toString() ?? "";
}

const generateOllamaAction = async (
  _prevResult: FormActionResult,
  formData: FormData
): Promise<FormActionResult> => {
  const deepSeekPrompt = getFormDataValue(formData, "deepSeekPrompt");
  const aiModel = getFormDataValue(formData, "aiModel");

  const config = {
    model: aiModel,
    temperature: 0.7,
    max_tokens: 2048, 
  };

  return await generateWithOllama(deepSeekPrompt, config);
};

const assignUserToProjectAction = async (
  userId: string,
  projectId: string
): Promise<FormActionResult> => {
  await assignUserToProject(userId, projectId);
  revalidatePath("/dashboard");
  return { success: "User assigned to project successfully" };
};

const unassignUserFromProjectAction = async (
  userId: string,
  projectId: string
) => {  
  await unassignUserFromProject(userId, projectId);
  revalidatePath("/dashboard");
  return { success: "User unassigned from project successfully" };
};

const createProjectAction = async (
  projectName: string
): Promise<FormActionResult> => {
  const startDate = new Date();
  console.log("Creating project:", projectName, "with start date:", startDate);
  const project = await createProject(projectName, startDate, null);
  revalidatePath("/dashboard");
  return { success: `Project '${projectName}' created successfully` };
};

const deleteProjectAction = async (
  projectId: string 
): Promise<FormActionResult> => {
  const project = await getProjectById(projectId);
  if (!project) {
    return { error: "Project not found" };
  }
  await deleteProject(projectId);
  revalidatePath("/dashboard");
  return { success: `Project '${project.name}' deleted successfully` };
};

const getUnassignedProjectsAction = async (
  userId: string
) => {
  const unassignedProjects: Project[] = await getUnassignedProjects(userId);
  return unassignedProjects;
};

const getAssignedProjectsAction = async (
  userId: string
) => {
  const assignedProjects: Project[] = await getAssignedProjects(userId);
  return assignedProjects;
};

const searchProjectsAction = async (
  searchQuery: string
) => {
  const projects = await searchProjects(searchQuery);
  return projects;
};

const updateProjectAction = async (
  projectId: string,
  projectName: string
) => {
  await updateProject(projectId, projectName);
  revalidatePath("/dashboard");
};

export { 
  generateOllamaAction, 
  createProjectAction, 
  deleteProjectAction,
  assignUserToProjectAction,
  getAssignedProjectsAction,
  getUnassignedProjectsAction,
  unassignUserFromProjectAction,
  searchProjectsAction,
  updateProjectAction,
};
