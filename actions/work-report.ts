"use server";

import { revalidatePath } from "next/cache";
import { AttendanceDto } from "@/types/attendance";
import {
  createWorkReport,
  updateWorkReportAttendances,
  getWorkReportsByContractId,
  getWorkReportsByContractIdAndYearMonthDateRange,
} from "@/data/work-report";
import { WorkReportDto } from "@/types/work-report";
import { WorkReport as PrismaWorkReport } from "@prisma/client";

export const createWorkReportAction = async (
  contractId: string,
  targetDate: Date
): Promise<WorkReportDto> => {
  const workReport = await createWorkReport(contractId, targetDate);
  revalidatePath(`/workReport/${contractId}`);
  return convertPrismaWorkReportToWorkReportDto(workReport);
};

export const updateWorkReportAttendancesAction = async (
  contractId: string,
  workReportId: string,
  attendances: AttendanceDto[]
): Promise<WorkReportDto> => {
  const workReport = await updateWorkReportAttendances(workReportId, attendances);
  revalidatePath(`/workReport/${contractId}/${workReportId}`);
  return convertPrismaWorkReportToWorkReportDto(workReport);
};

export const getWorkReportsByContractIdAction = async (contractId: string): Promise<WorkReportDto[]> => {
  try {
    return (await getWorkReportsByContractId(contractId)).map(convertPrismaWorkReportToWorkReportDto);
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error("Failed to fetch work reports");
  }
};

export const getWorkReportsByContractIdAndYearMonthDateRangeAction = async (
  contractId: string,
  fromDate?: Date,
  toDate?: Date
): Promise<WorkReportDto[]> => {
  try {
    return (await getWorkReportsByContractIdAndYearMonthDateRange(
      contractId,
      fromDate,
      toDate
    )).map(convertPrismaWorkReportToWorkReportDto);
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error("Failed to fetch work reports");
  }
}; 

function convertPrismaWorkReportToWorkReportDto(workReport: PrismaWorkReport): WorkReportDto {
  return {
    ...workReport,
    memo: workReport.memo ?? undefined,
  };
}
