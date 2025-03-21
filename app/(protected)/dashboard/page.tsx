import { getCurrentWorkReports } from "@/data/work-report";
import DashboardClientPage from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ダッシュボード",
    description: "ダッシュボード",
};

export default async function DashboardPage() {
    const groupedWorkReports = await getCurrentWorkReports();
    
    return (
        <DashboardClientPage groupedWorkReports={groupedWorkReports} />
    )
}