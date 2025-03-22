"use server";

import { revalidatePath } from "next/cache";
import { AttendanceFormValues } from "@/types/attendance";
import {
  createWorkReport,
  updateWorkReportAttendances,
  getWorkReportsByContractId,
  getWorkReportsByContractIdAndYearAndMonthRange,
} from "@/data/work-report";

export const createWorkReportAction = async (
  contractId: string,
  year: number,
  month: number
) => {
  await createWorkReport(contractId, year, month);
  revalidatePath(`/workReport/${contractId}`);
};

export const updateWorkReportAction = async (
  contractId: string,
  workReportId: string,
  attendance: AttendanceFormValues
) => {
  await updateWorkReportAttendances(workReportId, attendance);
  revalidatePath(`/workReport/${contractId}/${workReportId}`);
};

export const getWorkReportsByContractIdAction = async (contractId: string) => {
  try {
    return await getWorkReportsByContractId(contractId);
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error("Failed to fetch work reports");
  }
};

export const getWorkReportsByContractIdAndYearAndMonthRangeAction = async (
  contractId: string,
  fromYear: number,
  fromMonth: number,
  toYear: number,
  toMonth: number
) => {
  try {
    return await getWorkReportsByContractIdAndYearAndMonthRange(
      contractId,
      fromYear,
      fromMonth,
      toYear,
      toMonth
    );
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error("Failed to fetch work reports");
  }
}; 