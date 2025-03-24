import { Client as PrismaClient } from "@prisma/client";
import { NullableToUndefined } from "@/lib/utils";

export type Client = NullableToUndefined<PrismaClient>;
