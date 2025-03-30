import { WorkReport as PrismaWorkReport } from "@prisma/client";

import { SerializedType } from "@/lib/utils";

export type WorkReport = SerializedType<PrismaWorkReport>;

export type WorkReportStatus = WorkReport["status"];
