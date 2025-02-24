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
  createWorkReport,
  getUserProjects,
  updateWorkReportAttendances,
  getUserProjectWorkReports,
} from "@/data/work-time";
import { revalidatePath } from "next/cache";
import { FormActionResult } from '@/models/form-action-result';
import { generateWithOllama } from '@/lib/ai';
import { Project } from "@prisma/client";

interface AttendanceEntry {
  start: string;
  end: string;
}

interface AttendanceFormValues {
  [day: string]: AttendanceEntry;
}

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
) => {
  await assignUserToProject(userId, projectId);
  revalidatePath("/dashboard");
};

const unassignUserFromProjectAction = async (
  userId: string,
  projectId: string
) => {  
  await unassignUserFromProject(userId, projectId);
  revalidatePath("/dashboard");
};

const createProjectAction = async (
  projectName: string
) => {
  const startDate = new Date();
  console.log("Creating project:", projectName, "with start date:", startDate);
  await createProject(projectName, startDate, null);
  revalidatePath("/projectMaster");
};

const deleteProjectAction = async (
  projectId: string 
) => {
  const project = await getProjectById(projectId);
  if (!project) {
    return { error: "Project not found" };
  }
  await deleteProject(projectId);
  revalidatePath("/projectMaster");
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

const createWorkReportAction = async (
  userProjectId: string,
  startDate: Date,
  endDate: Date
) => {
  await createWorkReport(userProjectId, startDate, endDate);
  revalidatePath("/workTimeReport/[userProjectId]");
};

const getUserProjectWorkReportsAction = async (
  userProjectId: string
) => {
  const workReports = await getUserProjectWorkReports(userProjectId);
  return workReports;
};

const updateWorkReportAction = async (
  userProjectId: string,
  workReportId: string,
  attendance: AttendanceFormValues
) => {
  await updateWorkReportAttendances(workReportId, attendance);
  revalidatePath("/workTimeReport/[userProjectId]/[workReportId]");
};

const getUserProjectsAction = async (
  userId: string
) => {
  const userProjects = await getUserProjects(userId);
  return userProjects;
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
  createWorkReportAction,
  updateWorkReportAction,
  getUserProjectsAction,
  getUserProjectWorkReportsAction,
};
