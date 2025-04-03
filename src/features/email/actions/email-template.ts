"use server";

import { revalidatePath } from "next/cache";
import { StrictOmit } from "ts-essentials";

import {
  getEmailTemplatesByCreateUserId,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "@/features/email/data/email-template";
import { EmailTemplate } from "@/features/email/types/email-template";

export const getEmailTemplatesByCreateUserIdAction = async (
  createUserId: string,
): Promise<EmailTemplate[]> => {
  try {
    const templates = await getEmailTemplatesByCreateUserId(createUserId);
    return templates;
  } catch (error) {
    console.error("Error fetching email templates:", error);
    throw new Error("Failed to fetch email templates");
  }
};

export const createEmailTemplateAction = async (
  values: StrictOmit<EmailTemplate, "id">,
) => {
  try {
    const template = await createEmailTemplate(values);
    revalidatePath("/emailTemplate");
    return template;
  } catch (error) {
    console.error("Error creating email template:", error);
    throw new Error("Failed to create email template");
  }
};

export const updateEmailTemplateAction = async (
  id: string,
  values: StrictOmit<EmailTemplate, "id">,
) => {
  try {
    const template = await updateEmailTemplate(id, values);
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
