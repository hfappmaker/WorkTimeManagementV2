import { Contract as PrismaContract } from "@prisma/client";
import { ClientSideDataTransform } from "@/lib/utils";
export type Contract = ClientSideDataTransform<PrismaContract>;