"use server";

import {
  createContract,
  updateContract,
  deleteContract,
  searchContracts,
  getContractsByUserId,
  getContractById,
  getContractsByClientId,
} from "@/data/contract";
import {
  createWorkReport,
  updateWorkReportAttendances,
  getWorkReportsByContractId,
} from "@/data/work-report";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  updateEmailTemplate,
  getEmailTemplatesByCreateUserId,
} from "@/data/email-template";

import { revalidatePath } from "next/cache";
import { FormActionResult } from "@/models/form-action-result";
import { generateWithOllama } from "@/lib/ai";
import { z } from "zod";
import { ClientSchema, ContractSchema, EmailTemplateSchema } from "@/schemas";
import {
  getClientById,
  getClientsByUserId,
  createClient,
  updateClient,
  deleteClient,
} from "@/data/client";

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

export const createContractAction = async (
  values: z.infer<typeof ContractSchema>
) => {
  await createContract(values);
  console.log("Contract created successfully");
  revalidatePath("/client/[clientId]");
};

export const updateContractAction = async (
  id: string,
  values: z.infer<typeof ContractSchema>
) => {
  await updateContract(id, values);
  revalidatePath("/client/[clientId]");
};

export const deleteContractAction = async (id: string) => {
  await deleteContract(id);
  revalidatePath("/client/[clientId]");
};

export const searchContractsAction = async (
  userId: string,
  searchQuery: string
) => {
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
  workReportId: string,
  attendance: AttendanceFormValues
) => {
  await updateWorkReportAttendances(workReportId, attendance);
  revalidatePath("/workReport/[contractId]/[workReportId]");
};

export const getWorkReportsByContractIdAction = async (contractId: string) => {
  try {
    return await getWorkReportsByContractId(contractId);
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

export const getContractsByClientIdAction = async (clientId: string) => {
  try {
    const contracts = await getContractsByClientId(clientId);
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

export const getClientByIdAction = async (clientId: string) => {
  try {
    return await getClientById(clientId);
  } catch (error) {
    console.error("Error fetching client:", error);
    throw new Error("Failed to fetch client details");
  }
};

export const getClientsByUserIdAction = async (userId: string) => {
  try {
    return await getClientsByUserId(userId);
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
};

export const createClientAction = async (
  values: z.infer<typeof ClientSchema>
) => {
  await createClient(values);
  revalidatePath("/client");
};

export const updateClientAction = async (
  id: string,
  values: z.infer<typeof ClientSchema>
) => {
  await updateClient(id, values);
  revalidatePath("/client");
};

export const deleteClientAction = async (id: string) => {
  await deleteClient(id);
  revalidatePath("/client");
};

export const getEmailTemplatesByCreateUserIdAction = async (
  createUserId: string
) => {
  try {
    console.log("createUserId", createUserId);
    const templates = await getEmailTemplatesByCreateUserId(createUserId);
    console.log("templates", templates);
    return templates ? JSON.parse(JSON.stringify(templates)) : [];
  } catch (error) {
    console.error("Error fetching email templates:", error);
    throw new Error("Failed to fetch email templates");
  }
};

export const createEmailTemplateAction = async (
  values: z.infer<typeof EmailTemplateSchema>
) => {
  const name = values.name;
  const subject = values.subject;
  const body = values.body;
  const createUserId = values.createUserId;
  try {
    const template = await createEmailTemplate({
      name,
      subject,
      body,
      createUserId,
    });
    revalidatePath("/emailTemplate");
    return template;
  } catch (error) {
    console.error("Error creating email template:", error);
    throw new Error("Failed to create email template");
  }
};

export const updateEmailTemplateAction = async (
  id: string,
  values: z.infer<typeof EmailTemplateSchema>
) => {
  const name = values.name;
  const subject = values.subject;
  const body = values.body;
  try {
    const template = await updateEmailTemplate(id, { name, subject, body });
    revalidatePath("/emailTemplate");
    return template;
  } catch (error) {
    console.error("Error updating email template:", error);
    throw new Error("Failed to update email template");
  }
};

export const deleteEmailTemplateAction = async (id: string) => {
  try {
    await deleteEmailTemplate(id);
    revalidatePath("/emailTemplate");
  } catch (error) {
    console.error("Error deleting email template:", error);
    throw new Error("Failed to delete email template");
  }
};
