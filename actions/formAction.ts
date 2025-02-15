"use server";
import {
  createProject,
  assignUserToProject,
  getUnassignedProjects,
  unassignUserFromProject,
  getAssignedProjects,
} from "@/data/work-time";
import { revalidatePath } from "next/cache";
import { FormActionResult } from '@/models/form-action-result';
import { generateWithOllama } from '@/lib/ai';
import { Project } from "@prisma/client";

// ヘルパー型
interface FieldValidation {
  key: string;
  message: string;
}

/**
 * 指定された key の一覧について、formData から一度に値を取り出し、
 * その値と、必須チェックの結果（エラーメッセージ有無）を返す。
 */
function getRequiredFormFields(
  formData: FormData,
  fields: FieldValidation[]
): {
  values: Record<string, string>;
  errors: Record<string, { error: string | undefined; value: string }>;
} {
  const values: Record<string, string> = {};
  const errors: Record<string, { error: string | undefined; value: string }> = {};
  fields.forEach(({ key, message }) => {
    const val = formData.get(key)?.toString() ?? "";
    values[key] = val;
    errors[key] = { error: val.trim() ? undefined : message, value: val };
  });
  return { values, errors };
}

/**
 * formData から指定されたフィールド群を一度に取得し、各フィールドの必須バリデーション結果をまとめる
 * and returns { values, errors, isValid }.
 */
function validateRequiredFormData(
  formData: FormData,
  fields: FieldValidation[]
): {
  values: Record<string, string>;
  errors: Record<string, { error: string | undefined; value: string }>;
  isValid: boolean;
} {
  const { values, errors } = getRequiredFormFields(formData, fields);
  const isValid = !Object.values(errors).some(({ error }) => error !== undefined);
  return { values, errors, isValid };
}

const generateOllamaAction = async (
  _prevResult: FormActionResult,
  formData: FormData
): Promise<FormActionResult> => {
  const { values, errors, isValid } = validateRequiredFormData(formData, [
    { key: "deepSeekPrompt", message: "Prompt is required" },
    { key: "aiModel", message: "AI model selection is required" },
  ]);
  if (!isValid) return { errors };

  const config = {
    model: values.aiModel,
    temperature: 0.7,
    max_tokens: 2048,
  };

  return await generateWithOllama(values.deepSeekPrompt, config);
};

const UnassignUserFromProjectAction = async (
  _prevResult: FormActionResult,
  formData: FormData
): Promise<FormActionResult> => {
  const { values, errors, isValid } = validateRequiredFormData(formData, [
    { key: "userId", message: "User and project are required" },
    { key: "projectId", message: "User and project are required" },
  ]);
  if (!isValid) return { errors };

  await unassignUserFromProject(values.userId, values.projectId);
  revalidatePath("/dashboard");
  return { success: "User unassigned from project successfully" };
};

const createProjectAction = async (
  _prevResult: FormActionResult,
  formData: FormData
): Promise<FormActionResult> => {
  const { values, errors, isValid } = validateRequiredFormData(formData, [
    { key: "projectName", message: "Project name is required" },
    { key: "startDate", message: "Start date is required" },
  ]);
  if (!isValid) return { errors };

  const startDate = new Date(values.startDate);
  console.log("Creating project:", values.projectName, "with start date:", startDate);
  const project = await createProject(values.projectName, startDate, null);
  revalidatePath("/dashboard");
  return { success: `Project '${values.projectName}' created successfully` };
};

const assignUserToProjectAction = async (
  _prevResult: FormActionResult,
  formData: FormData
): Promise<FormActionResult> => {
  const { values, errors, isValid } = validateRequiredFormData(formData, [
    { key: "userId", message: "User and project are required" },
    { key: "projectId", message: "User and project are required" },
  ]);
  if (!isValid) return { errors };

  await assignUserToProject(values.userId, values.projectId);
  revalidatePath("/dashboard");
  return { success: "User assigned to project successfully" };
};

const getUnassignedProjectsAction = async (
  _prevResult: Project[],
  userId: string
) => {
  const unassignedProjects: Project[] = await getUnassignedProjects(userId);
  return unassignedProjects;
};

const getAssignedProjectsAction = async (
  _prevResult: Project[],
  userId: string
) => {
  const assignedProjects: Project[] = await getAssignedProjects(userId);
  return assignedProjects;
};

export { 
  generateOllamaAction, 
  createProjectAction, 
  assignUserToProjectAction, 
  getUnassignedProjectsAction, 
  UnassignUserFromProjectAction, 
  getAssignedProjectsAction 
};
