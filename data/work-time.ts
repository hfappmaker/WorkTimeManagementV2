import { db } from "@/lib/db";

export async function getWorkTimesByReportId(workTimeReportId: string) {
  const workTimes = await db.workTime.findMany({
    where: {
      workTimeReportId: workTimeReportId,
    },
  });

  return workTimes;
}

export async function getOpenedWorkTimeReport(userId: string, projectId: string) {
  const workTimeReport = await db.workTimeReport.findFirst({
    where: {
      userId: userId,
      projectId: projectId,
      endTime: null,
    },
  });

  return workTimeReport;
}
