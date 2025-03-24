import { Attendance } from "@/types/attendance";
import { getAttendancesByWorkReportId } from "@/data/attendance";

export const getAttendancesByWorkReportIdAction = async (
  workReportId: string
): Promise<Attendance[]> => {
  try {
    const attendances = await getAttendancesByWorkReportId(workReportId);
    return attendances.map((attendance) => ({
      ...attendance,
      startTime: attendance.startTime ?? undefined,
      endTime: attendance.endTime ?? undefined,
      breakDuration: attendance.breakDuration ?? undefined,
      memo: attendance.memo ?? undefined,
    }));
  } catch (error) {
    console.error("Error fetching attendances:", error);
    throw new Error("Failed to fetch attendances");
  }
};
