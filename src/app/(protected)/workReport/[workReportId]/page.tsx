import { Metadata } from "next";
import { notFound } from "next/navigation";

import { currentUser } from "@/features/auth/lib/auth";
import { getAttendancesByWorkReportIdAction } from "@/features/work-report/actions/attendance";
import { getWorkReportById } from "@/repositories/work-report/work-report-repository";
import { getContractById } from "@/repositories/contract/contract-repository";
import { Serialize } from "@/utils/serialization/serialization-utils";


import ClientWorkReportPage from "./page.client";


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
  // TODO: 契約の作成者がログインユーザーと一致するか確認
  if (!contract || contract.userId !== user?.id) {
    return notFound();
  }

  const attendances = await getAttendancesByWorkReportIdAction(workReportId);

  return (
    <ClientWorkReportPage
      contractId={contract.id}
      workReportId={workReportId}
      targetDate={Serialize(workReport.targetDate)}
      userName={user.name ?? ""}
      attendances={attendances}
      contractName={contract.name}
      clientName={contract.client.name}
      contactName={contract.client.contactName}
      clientEmail={contract.client.email}
      dailyWorkMinutes={contract.dailyWorkMinutes ?? 1}
      monthlyWorkMinutes={contract.monthlyWorkMinutes ?? 1}
      basicStartTime={Serialize(contract.basicStartTime ?? undefined)}
      basicEndTime={Serialize(contract.basicEndTime ?? undefined)}
      basicBreakDuration={Serialize(contract.basicBreakDuration ?? undefined)}
      closingDay={Serialize(contract.closingDay ?? undefined)}
    />
  );
}