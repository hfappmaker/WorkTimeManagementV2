"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useTransitionContext } from "@/contexts/TransitionContext";
import { $Enums } from "@prisma/client";
import { WorkReport } from "@/types/work-report";
import { Contract } from "@/types/contract";
import { Client } from "@/types/client";
import { RenameProperty , TransformType } from "@/lib/utils";

type WorkReportDashboard = Pick<TransformType<WorkReport, $Enums.WorkReportStatus, string>, 'id' | 'targetDate' | 'status'>;

type ContractDashboard = RenameProperty<Pick<Contract, 'name'>, 'name', 'contractName'> & {
    workReports: WorkReportDashboard[];
};

type ClientDashboard = RenameProperty<Pick<Client, 'name'>, 'name', 'clientName'> & {
    contracts: Record<string, ContractDashboard>;
};

interface DashboardClientPageProps {
    groupedWorkReports: Record<string, ClientDashboard>;
}

export default function DashboardClientPage({ groupedWorkReports }: DashboardClientPageProps) {
    const router = useRouter();
    const { startTransition } = useTransitionContext();
    const getStatusColor = (status: string) => {
        switch (status) {
            case "DRAFT":
                return "bg-yellow-200 text-yellow-800";
            case "SUBMITTED":
                return "bg-blue-200 text-blue-800";
            case "APPROVED":
                return "bg-green-200 text-green-800";
            case "REJECTED":
                return "bg-red-200 text-red-800";
            default:
                return "bg-gray-200 text-gray-800";
        }
    };

    const handleNavigation = (reportId: string) => {
        startTransition(() => {
            router.push(`/workReport/${reportId}`);
        });
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-6">現在の作業報告書一覧</h1>

            {Object.entries(groupedWorkReports).map(([clientId, client]) => (
                <Card key={clientId} className="mb-6">
                    <CardHeader>
                        <CardTitle>{client.clientName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(client.contracts).map(([contractId, contract]) => (
                                <div key={contractId} className="border rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-2">{contract.contractName}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {contract.workReports.map((workReport) => (
                                            <div
                                                key={workReport.id}
                                                className="block p-4 border rounded-lg transition-colors cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start mb-2 space-x-2">
                                                    <div className="text-lg font-medium hover:underline" onClick={() => handleNavigation(workReport.id)}>
                                                        {workReport.targetDate.getFullYear()}年{workReport.targetDate.getMonth() + 1}月
                                                    </div>
                                                    <Badge className={getStatusColor(workReport.status)}>
                                                        {workReport.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}