import { getContractById } from "@/data/contract";
import ClientWorkReportPage from "./page.client";
import { getWorkReportById, getAttendancesByWorkReportId } from "@/data/work-report"
import { currentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
// Helper function to format minutes as "HH:MM"
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export default async function WorkReportPage({ params }: { params: Promise<{ workReportId: string }> }) {
  const { workReportId } = await params;
  const user = await currentUser();
  // Assume that getWorkReportById returns a work report with startDate and endDate as strings or Date objects.
  const workReport = await getWorkReportById(workReportId);
  if (!workReport) {
    return notFound();
  }
  
  // 契約情報を取得
  const contract = await getContractById(workReport.contractId);
  if (!contract || contract.client.createUserId !== user?.id) {
    return notFound();
  }
  
  // Fetch raw attendances from the DB.
  const rawAttendances = await getAttendancesByWorkReportId(workReportId);

  // Map each attendance to the expected AttendanceRecord type.
  const attendances = rawAttendances.map(att => ({
    date: att.date.toISOString().split('T')[0],
    start: att.startTime ? att.startTime.toISOString().split('T')[1].substring(0, 5) : null,
    end: att.endTime ? att.endTime.toISOString().split('T')[1].substring(0, 5) : null,
    breakDuration: att.breakDuration ? formatDuration(att.breakDuration) : null,
    memo: att.memo ? att.memo : null
  }));
  
  return (
    <ClientWorkReportPage 
      workReportId={workReportId}
      workReport={{
        year: workReport.year,
        month: workReport.month,
      }}
      userName={user.name}
      attendances={attendances}
      contractName={contract.name}
      clientName={contract.client.name}
      clientEmail={contract.client.email}
      closingDay={contract.closingDay}
    />
  );
}