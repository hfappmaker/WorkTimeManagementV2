import { Client } from "@/features/client/types/client";
import { Contract } from "@/features/contract/types/contract";
import { WorkReport } from "@/features/work-report/types/work-report";
import { RenameProperty } from "@/utils/types/type-utils";

export type WorkReportDashboard = Pick<
  WorkReport,
  "id" | "targetDate" | "status"
>;

export type ContractDashboard = RenameProperty<
  Pick<Contract, "name">,
  "name",
  "contractName"
> & {
  workReports: WorkReportDashboard[];
};

export type ClientDashboard = RenameProperty<
  Pick<Client, "name">,
  "name",
  "clientName"
> & {
  contracts: Record<string, ContractDashboard>;
};

export type DashboardClientPageProps = {
  groupedWorkReports: Record<string, ClientDashboard>;
};
