"use server";
import { Attendance } from "@/types/attendance";
import { getAttendancesByWorkReportId } from "@/data/attendance";
import { updateWorkReportAttendance } from "@/data/attendance";
import { revalidatePath } from "next/cache";
import { Attendance as PrismaAttendance } from "@prisma/client";

export const getAttendancesByWorkReportIdAction = async (
  workReportId: string
): Promise<Attendance[]> => {
  try {
    const attendances = await getAttendancesByWorkReportId(workReportId);
    return attendances.map(convertPrismaAttendanceToAttendance);
  } catch (error) {
    console.error("Error fetching attendances:", error);
    throw new Error("Failed to fetch attendances");
  }
};

export const updateWorkReportAttendanceAction = async (
  contractId: string,
  workReportId: string,
  date: Date,
  attendance: Attendance 
): Promise<Attendance> => {
  const updatedAttendance = await updateWorkReportAttendance(workReportId, date, attendance);
  revalidatePath(`/workReport/${contractId}/${workReportId}`);
  return convertPrismaAttendanceToAttendance(updatedAttendance);
};

function convertPrismaAttendanceToAttendance(attendance: PrismaAttendance): Attendance {
  return {
    ...attendance,
    startTime: attendance.startTime ?? undefined,
    endTime: attendance.endTime ?? undefined,
    breakDuration: attendance.breakDuration ?? undefined,
    memo: attendance.memo ?? undefined,
  };
}
