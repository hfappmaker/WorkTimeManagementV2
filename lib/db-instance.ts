import { PrismaClient } from "@prisma/client";

// 最初にインスタンスを作成しておく
export const baseDb = new PrismaClient(); 