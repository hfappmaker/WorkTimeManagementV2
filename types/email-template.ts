import { EmailTemplate as PrismaEmailTemplate } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

export type EmailTemplate = StrictOmit<PrismaEmailTemplate, 'createdAt' | 'updatedAt'>;
