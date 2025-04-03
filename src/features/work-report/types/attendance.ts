import { Attendance as PrismaAttendance } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

import { SerializedType } from "@/utils/serialization/serialization-utils";

export type AttendanceDto = SerializedType<StrictOmit<PrismaAttendance, "id">>;

export type AttendanceData = StrictOmit<AttendanceDto, "workReportId">;
