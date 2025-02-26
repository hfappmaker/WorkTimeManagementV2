"use server";

import {
  createContract,
  updateContract,
  deleteContract,
  createWorkReport,
  searchContracts,
  updateWorkReportAttendances,
  getWorkReportsByContractId,
  getContractsByUserId,
} from "@/data/work-time";
import { revalidatePath } from "next/cache";
import { FormActionResult } from '@/models/form-action-result';
import { generateWithOllama } from '@/lib/ai';
import { z } from 'zod';
import { ContractSchema } from '@/schemas';

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

const createContractAction = async (values: z.infer<typeof ContractSchema>) => {
  await createContract(values);
  console.log("Contract created successfully");
  revalidatePath("/dashboard");
};

const updateContractAction = async (id: string, values: z.infer<typeof ContractSchema>) => {
  await updateContract(id, values);
  revalidatePath("/contractMaster");
};  

const deleteContractAction = async (id: string) => {
  await deleteContract(id);
  revalidatePath("/contractMaster");
};

const searchContractsAction = async (userId: string, searchQuery: string) => {
  const contracts = await searchContracts(userId, searchQuery);
  return contracts;
};

const createWorkReportAction = async (
  userProjectId: string,
  startDate: Date,
  endDate: Date
) => {
  await createWorkReport(userProjectId, startDate, endDate);
  revalidatePath("/workTimeReport/[userProjectId]");
};

const updateWorkReportAction = async (
  userProjectId: string,
  workReportId: string,
  attendance: AttendanceFormValues
) => {
  await updateWorkReportAttendances(workReportId, attendance);
  revalidatePath("/workTimeReport/[userProjectId]/[workReportId]");
};

const getWorkReportsByContractIdAction = async (userProjectId: string) => {
  const workReports = await getWorkReportsByContractId(userProjectId);
  return workReports;
};

const getContractsByUserIdAction = async (userId: string) => {
  const contracts = await getContractsByUserId(userId);
  return contracts;
};

export { 
  generateOllamaAction, 
  createContractAction,
  createWorkReportAction,
  updateWorkReportAction,
  updateContractAction,
  deleteContractAction,
  searchContractsAction,
  getWorkReportsByContractIdAction,
  getContractsByUserIdAction,
};
