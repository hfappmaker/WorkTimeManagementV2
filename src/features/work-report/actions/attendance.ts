"use server";
import { Attendance as PrismaAttendance } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  getAttendancesByWorkReportId,
  updateWorkReportAttendance,
} from "@/features/work-report/repositories/attendance-repository";
import { AttendanceDto } from "@/features/work-report/types/attendance";

export const getAttendancesByWorkReportIdAction = async (
  workReportId: string,
): Promise<AttendanceDto[]> => {
  try {
    const attendances = await getAttendancesByWorkReportId(workReportId);
    return attendances.map(convertPrismaAttendanceToAttendanceDto);
  } catch (error) {
    console.error("Error fetching attendances:", error);
    throw new Error("Failed to fetch attendances");
  }
};

export const updateWorkReportAttendanceAction = async (
  contractId: string,
  workReportId: string,
  date: Date,
  attendance: AttendanceDto,
): Promise<AttendanceDto> => {
  const updatedAttendance = await updateWorkReportAttendance(
    workReportId,
    date,
    attendance,
  );
  revalidatePath(`/workReport/${contractId}/${workReportId}`);
  return convertPrismaAttendanceToAttendanceDto(updatedAttendance);
};

function convertPrismaAttendanceToAttendanceDto(
  attendance: PrismaAttendance,
): AttendanceDto {
  return {
    ...attendance,
    startTime: attendance.startTime ?? undefined,
    endTime: attendance.endTime ?? undefined,
    breakDuration: attendance.breakDuration ?? undefined,
    memo: attendance.memo ?? undefined,
  };
}
