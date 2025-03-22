import { getContractById } from "@/data/contract";
import ClientWorkReportPage from "./page.client";
import { getWorkReportById, getAttendancesByWorkReportId } from "@/data/work-report"
import { currentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Metadata } from "next";

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
    attendanceEntry: {
      startTime: att.startTime ? att.startTime : null,
      endTime: att.endTime ? att.endTime : null,
      breakDuration: att.breakDuration ? att.breakDuration : null,
      memo: att.memo ? att.memo : ""
    }
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
      dailyWorkMinutes={contract.dailyWorkMinutes ?? 1}
      monthlyWorkMinutes={contract.monthlyWorkMinutes ?? 1}
      basicStartTime={contract.basicStartTime}
      basicEndTime={contract.basicEndTime}
      basicBreakDuration={contract.basicBreakDuration}
      closingDay={contract.closingDay}
    />
  );
}