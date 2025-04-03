import { db } from "@/lib/db";

export async function getEmailTemplatesByCreateUserId(createUserId: string) {
  return await db.emailTemplate.findMany({
    where: { createUserId: createUserId },
  });
}

export async function getEmailTemplateById(id: string) {
  return await db.emailTemplate.findUnique({
    where: { id },
  });
}

export async function createEmailTemplate(data: { name: string; subject: string; body: string; createUserId: string; }) {
  return await db.emailTemplate.create({
    data,
  });
}

export async function updateEmailTemplate(id: string, data: { name?: string; subject?: string; body?: string; }) {
  return await db.emailTemplate.update({
    where: { id },
    data,
  });
}

export async function deleteEmailTemplate(id: string) {
  return await db.emailTemplate.delete({
    where: { id },
  });
}
