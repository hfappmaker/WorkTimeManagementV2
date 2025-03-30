import { Attendance as PrismaAttendance } from "@prisma/client";

import { db } from "@/lib/db";
import { AttendanceDto } from "@/types/attendance";

export async function getAttendancesByWorkReportId(
  workReportId: string
): Promise<PrismaAttendance[]> {
  const attendances = await db.attendance.findMany({
    where: {
      workReportId: workReportId,
    },
  });

  return attendances;
}

export async function updateWorkReportAttendance(
  workReportId: string,
  date: Date,
  attendance: AttendanceDto
): Promise<PrismaAttendance> {
  const updatedAttendance = await db.attendance.upsert({
    where: { date_workReportId: { date, workReportId } },
    update: {
      startTime: attendance.startTime ?? null,
      endTime: attendance.endTime ?? null,
      breakDuration: attendance.breakDuration ?? null,
      memo: attendance.memo ?? null,
    },
    create: {
      date,
      workReportId,
      startTime: attendance.startTime ?? null,
      endTime: attendance.endTime ?? null,
      breakDuration: attendance.breakDuration ?? null,
      memo: attendance.memo ?? null,
    },
  });

  return updatedAttendance;
}
