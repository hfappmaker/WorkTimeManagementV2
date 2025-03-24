import { Contract as PrismaContract } from "@prisma/client";
import { DecimalToNumber } from "@/lib/utils";
export type Contract = DecimalToNumber<PrismaContract>;