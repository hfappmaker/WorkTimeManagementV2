import { WorkReport as PrismaWorkReport, $Enums } from "@prisma/client";
import { TransformTypeMulti } from "@/lib/utils";

export type WorkReport = TransformTypeMulti<PrismaWorkReport, [
    [$Enums.WorkReportStatus, WorkReportStatus],
    [null, undefined]
]>;

export type WorkReportStatus = $Enums.WorkReportStatus;