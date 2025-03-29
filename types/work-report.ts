import { WorkReport as PrismaWorkReport } from "@prisma/client";
import { NullableToUndefined } from "@/lib/utils";

export type WorkReport = NullableToUndefined<PrismaWorkReport>;

export type WorkReportStatus = WorkReport["status"];
