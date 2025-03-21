import { getContractById } from "@/data/contract";
import ClientWorkReportPage from "./page.client";
import { getWorkReportById, getAttendancesByWorkReportId } from "@/data/work-report"
import { currentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Metadata } from "next";
// Helper function to format minutes as "HH:MM"
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export const metadata: Metadata = {
  title: "作業報告書",
  description: "作業報告書",
};

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
    date: att.date.toISOString().split('T')[0].replace(/-/g, '/'),
    start: att.startTime ? att.startTime.toISOString().split('T')[1].substring(0, 5) : null,
    end: att.endTime ? att.endTime.toISOString().split('T')[1].substring(0, 5) : null,
    breakDuration: att.breakDuration ? formatDuration(att.breakDuration) : null,
    memo: att.memo ? att.memo : null
  }));

  console.log("attendances", attendances);
  
  return (
    <ClientWorkReportPage 
      contractId={contract.id}
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
      dailyWorkMinutes={contract.dailyWorkMinutes ?? 15}
      monthlyWorkMinutes={contract.monthlyWorkMinutes ?? 15}
      basicStartTime={contract.basicStartTime ? { hour: contract.basicStartTime.getHours(), minute: contract.basicStartTime.getMinutes() } : { hour: 9, minute: 0 }}
      basicEndTime={contract.basicEndTime ? { hour: contract.basicEndTime.getHours(), minute: contract.basicEndTime.getMinutes() } : { hour: 18, minute: 0 }}
      basicBreakDuration={contract.basicBreakDuration ? { 
        hour: Math.floor(contract.basicBreakDuration / 60), 
        minute: contract.basicBreakDuration % 60 
      } : { hour: 1, minute: 0 }}
      closingDay={contract.closingDay}
    />
  );
}