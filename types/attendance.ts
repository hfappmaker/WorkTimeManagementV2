import { Attendance as PrismaAttendance } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

import { SerializedType } from "@/lib/utils";

export type AttendanceDto = SerializedType<StrictOmit<PrismaAttendance, "id">>;
