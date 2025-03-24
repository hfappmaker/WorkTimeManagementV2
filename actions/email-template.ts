"use server";

import { revalidatePath } from "next/cache";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  updateEmailTemplate,
  getEmailTemplatesByCreateUserId,
} from "@/data/email-template";
import { EmailTemplate } from "@/types/email-template";

export const getEmailTemplatesByCreateUserIdAction = async (
  createUserId: string
): Promise<EmailTemplate[]> => {
  try {
    const templates = await getEmailTemplatesByCreateUserId(createUserId);
    return templates ? JSON.parse(JSON.stringify(templates)) : [];
  } catch (error) {
    console.error("Error fetching email templates:", error);
    throw new Error("Failed to fetch email templates");
  }
};

export const createEmailTemplateAction = async (
  values: Omit<EmailTemplate, 'id'>
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
  values: Omit<EmailTemplate, 'id'>
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