"use server";

import { revalidatePath } from "next/cache";
import { AttendanceEntry, AttendanceFormValues } from "@/types/attendance";
import {
  createWorkReport,
  updateWorkReportAttendances,
  updateWorkReportAttendance,
  getWorkReportsByContractId,
  getWorkReportsByContractIdAndYearMonthDateRange,
} from "@/data/work-report";

export const createWorkReportAction = async (
  contractId: string,
  targetDate: Date
) => {
  await createWorkReport(contractId, targetDate);
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

export const updateWorkReportAttendanceAction = async (
  contractId: string,
  workReportId: string,
  date: Date,
  attendance: AttendanceEntry 
) => {
  await updateWorkReportAttendance(workReportId, date, attendance);
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

export const getWorkReportsByContractIdAndYearMonthDateRangeAction = async (
  contractId: string,
  fromDate?: Date,
  toDate?: Date
) => {
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