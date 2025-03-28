import { getContractById } from "@/data/contract";
import ClientWorkReportPage from "./page.client";
import { getWorkReportById } from "@/data/work-report"
import { getAttendancesByWorkReportIdAction } from "@/actions/attendance";
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

  const attendances = await getAttendancesByWorkReportIdAction(workReportId);
  
  return (
    <ClientWorkReportPage 
      contractId={contract.id}
      workReportId={workReportId}
      targetDate={workReport.targetDate}
      userName={user.name}
      attendances={attendances}
      contractName={contract.name}
      clientName={contract.client.name}
      contactName={contract.client.contactName}
      clientEmail={contract.client.email}
      dailyWorkMinutes={contract.dailyWorkMinutes ?? 1}
      monthlyWorkMinutes={contract.monthlyWorkMinutes ?? 1}
      basicStartTime={contract.basicStartTime ?? undefined}
      basicEndTime={contract.basicEndTime ?? undefined}
      basicBreakDuration={contract.basicBreakDuration ?? undefined}
      closingDay={contract.closingDay ?? undefined}
    />
  );
}