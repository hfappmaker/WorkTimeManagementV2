"use server";

import { revalidatePath } from "next/cache";
import { Attendance } from "@/types/attendance";
import {
  createWorkReport,
  updateWorkReportAttendances,
  getWorkReportsByContractId,
  getWorkReportsByContractIdAndYearMonthDateRange,
} from "@/data/work-report";
import { WorkReport } from "@/types/work-report";

export const createWorkReportAction = async (
  contractId: string,
  targetDate: Date
): Promise<WorkReport> => {
  const workReport = await createWorkReport(contractId, targetDate);
  revalidatePath(`/workReport/${contractId}`);
  return workReport;
};

export const updateWorkReportAttendancesAction = async (
  contractId: string,
  workReportId: string,
  attendances: Attendance[]
): Promise<WorkReport> => {
  const workReport = await updateWorkReportAttendances(workReportId, attendances);
  revalidatePath(`/workReport/${contractId}/${workReportId}`);
  return workReport;
};

export const getWorkReportsByContractIdAction = async (contractId: string): Promise<WorkReport[]> => {
  try {
    return await getWorkReportsByContractId(contractId);
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error("Failed to fetch work reports");
  }
};

export const getWorkReportsByContractIdAndYearMonthDateRangeAction = async (
  contractId: string,
  fromDate?: Date,
  toDate?: Date
): Promise<WorkReport[]> => {
  try {
    return await getWorkReportsByContractIdAndYearMonthDateRange(
      contractId,
      fromDate,
      toDate
    );
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error("Failed to fetch work reports");
  }
}; 