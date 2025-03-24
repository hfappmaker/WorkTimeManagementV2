import { Attendance as PrismaAttendance } from "@prisma/client";
import { NullableToUndefined } from "@/lib/utils";
import { StrictOmit } from "ts-essentials";

export type Attendance = NullableToUndefined<StrictOmit<PrismaAttendance, 'id'>>;
