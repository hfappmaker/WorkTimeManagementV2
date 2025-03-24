import { User as PrismaUser } from "@prisma/client";
import { NullableToUndefined } from "@/lib/utils";

export type User = NullableToUndefined<PrismaUser>;

