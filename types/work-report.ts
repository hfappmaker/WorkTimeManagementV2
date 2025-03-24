import { WorkReport as PrismaWorkReport } from "@prisma/client";
import { NullableToUndefined } from "@/lib/utils";

export type WorkReport = NullableToUndefined<PrismaWorkReport>;