import { EmailTemplate as PrismaEmailTemplate } from "@prisma/client";

export type EmailTemplate = Omit<PrismaEmailTemplate, 'createdAt' | 'updatedAt'>;
