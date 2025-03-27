import { WorkReport as PrismaWorkReport } from "@prisma/client";
import { NullableToUndefined } from "@/lib/utils";

export type WorkReportDto = NullableToUndefined<PrismaWorkReport>;

export type WorkReportStatus = WorkReportDto["status"];
