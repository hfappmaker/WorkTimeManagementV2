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
  getContractById,
} from "@/data/work-time";
import { revalidatePath } from "next/cache";
import { FormActionResult } from '@/models/form-action-result';
import { generateWithOllama } from '@/lib/ai';
import { z } from 'zod';
import { ContractSchema } from '@/schemas';

interface AttendanceEntry {
  start: string;
  end: string;
  breakDuration: string;
}

interface AttendanceFormValues {
  [day: string]: AttendanceEntry;
}

function getFormDataValue(formData: FormData, key: string): string {
  return formData.get(key)?.toString() ?? "";
}

export const generateOllamaAction = async (
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

export const createContractAction = async (values: z.infer<typeof ContractSchema>) => {
  await createContract(values);
  console.log("Contract created successfully");
  revalidatePath("/dashboard");
};

export const updateContractAction = async (id: string, values: z.infer<typeof ContractSchema>) => {
  await updateContract(id, values);
  revalidatePath("/contractMaster");
};  

export const deleteContractAction = async (id: string) => {
  await deleteContract(id);
  revalidatePath("/contractMaster");
};

export const searchContractsAction = async (userId: string, searchQuery: string) => {
  try {
    const contracts = await searchContracts(userId, searchQuery);
    return contracts ? JSON.parse(JSON.stringify(contracts)) : [];
  } catch (error) {
    console.error("Error searching contracts:", error);
    throw new Error("Failed to search contracts");
  }
};

export const createWorkReportAction = async (
  contractId: string,
  year: number,
  month: number
) => {
  await createWorkReport(contractId, year, month);
  revalidatePath("/workReport/[contractId]");
};

export const updateWorkReportAction = async (
  contractId: string,
  workReportId: string,
  attendance: AttendanceFormValues
) => {
  await updateWorkReportAttendances(workReportId, attendance);
  revalidatePath("/workReport/[contractId]/[workReportId]");
};

export const getWorkReportsByContractIdAction = async (contractId: string) => {
  try {
    const reports = await getWorkReportsByContractId(contractId);
    return reports ? JSON.parse(JSON.stringify(reports)) : [];
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error("Failed to fetch work reports");
  }
};

export const getContractsByUserIdAction = async (userId: string) => {
  try {
    const contracts = await getContractsByUserId(userId);
    return contracts ? JSON.parse(JSON.stringify(contracts)) : [];
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw new Error("Failed to fetch contracts");
  }
};

export const getContractByIdAction = async (contractId: string) => {
  try {
    const contract = await getContractById(contractId);
    return contract ? JSON.parse(JSON.stringify(contract)) : null;
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw new Error("Failed to fetch contract details");
  }
};
