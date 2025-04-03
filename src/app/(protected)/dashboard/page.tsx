import { Metadata } from "next";

import { getCurrentWorkReports } from "@/features/work-report/repositories/work-report-repository";

import DashboardClientPage from "./page.client";



export const metadata: Metadata = {
    title: "ダッシュボード",
    description: "ダッシュボード",
};

export default async function DashboardPage() {
    const groupedWorkReports = await getCurrentWorkReports();

    return <DashboardClientPage groupedWorkReports={groupedWorkReports} />;
}
