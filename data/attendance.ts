import { db } from "@/lib/db";

export async function getAttendancesByWorkReportId(workReportId: string) {
    const attendances = await db.attendance.findMany({
      where: {
        workReportId: workReportId,
      },
    });
  
    return attendances;
}