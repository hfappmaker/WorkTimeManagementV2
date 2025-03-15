import { getCurrentWorkReports } from "@/data/work-report";
import DashboardClientPage from "./page.client";

export default async function DashboardPage() {
    const groupedWorkReports = await getCurrentWorkReports();
    
    return (
        <DashboardClientPage groupedWorkReports={groupedWorkReports} />
    )
}