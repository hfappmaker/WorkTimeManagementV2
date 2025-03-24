import { Attendance as PrismaAttendance } from "@prisma/client";
import { NullableToUndefined } from "@/lib/utils";

export type Attendance = NullableToUndefined<Omit<PrismaAttendance, 'id'>>;
