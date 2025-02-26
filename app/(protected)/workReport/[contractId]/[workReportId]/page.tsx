import WorkReportClient from "./page.client";
import { getWorkReportById, getAttendancesByWorkReportId } from "@/data/work-time";
import { notFound } from "next/navigation";

export default async function WorkReport({ params: { userProjectId, workReportId } }: { params: { userProjectId: string; workReportId: string } }) {
  // Assume that getWorkReportById returns a work report with startDate and endDate as strings or Date objects.
  const workReport = await getWorkReportById(workReportId);
  if (!workReport) {
    // Return a 404 if not found
    notFound();
  }
  // Fetch raw attendances from the DB.
  const rawAttendances = await getAttendancesByWorkReportId(workReportId);

  // Map each attendance to the expected AttendanceRecord type.
  const attendances = rawAttendances.map(att => ({
    date: att.date.toISOString().split('T')[0],
    start: att.startTime ? att.startTime.toISOString().split('T')[1].substring(0, 5) : null,
    end: att.endTime ? att.endTime.toISOString().split('T')[1].substring(0, 5) : null
  }));
  
  return (
    <WorkReportClient 
      userProjectId={userProjectId} 
      workReportId={workReportId}
      workReport={{
        startDate: workReport.startDate.toISOString(),
        endDate: workReport.endDate.toISOString()
      }}
      attendances={attendances}
    />
  );
}