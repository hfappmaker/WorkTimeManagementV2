import { db } from "@/lib/db";
import { WorkReportStatus, Prisma } from "@prisma/client";
import { ContractSchema } from "@/schemas";
import { z } from "zod";

interface AttendanceEntry {
  start: string;
  end: string;
  breakDuration: string;
}

interface AttendanceFormValues {
  [day: string]: AttendanceEntry;
}

export async function getAttendancesByWorkReportId(workReportId: string) {
  const attendances = await db.attendance.findMany({
    where: {
      workReportId: workReportId,
    },
  });

  return attendances;
}

export async function getWorkReportById(workReportId: string) {
  const workReport = await db.workReport.findUnique({
    where: {
      id: workReportId,
    },
  });

  return workReport;
}

export async function getOpenedWorkReport(
  contractId: string
) {
  const workReport = await db.workReport.findFirst({
    where: {
      contractId: contractId,
      status: {
        notIn: [WorkReportStatus.COMPLETED, WorkReportStatus.APPROVED, WorkReportStatus.REJECTED],
      },
    },  
  });

  return workReport;
}

export async function createWorkReport(
  contractId: string,
  year: number,
  month: number
) {
  const workReport = await db.workReport.create({
    data: {
      contractId: contractId,
      year: year,
      month: month,
    },
  });

  return workReport;
}

export async function updateWorkReportAttendances(
  workReportId: string,
  attendance: AttendanceFormValues
) {
  const attendanceUpserts = Object.entries(attendance).map(([date, { start, end, breakDuration }]) => {
    const parsedDate = new Date(date);
    
    // 開始時間の検証
    let startTime = null;
    if (start && start.trim()) {
      try {
        const dateTime = new Date(`${date}T${start}:00.000Z`);
        startTime = isNaN(dateTime.getTime()) ? null : dateTime;
      } catch (e) {
        startTime = null;
      }
    }

    // 終了時間の検証
    let endTime = null;
    if (end && end.trim()) {
      try {
        const dateTime = new Date(`${date}T${end}:00.000Z`);
        endTime = isNaN(dateTime.getTime()) ? null : dateTime;
      } catch (e) {
        endTime = null;
      }
    }

    const breakDurationMinutes = parseInt(breakDuration) || 0;
    
    return {
      where: { date_workReportId: { date: parsedDate, workReportId } },
      update: { startTime, endTime, breakDuration: breakDurationMinutes },
      create: { date: parsedDate, startTime, endTime, breakDuration: breakDurationMinutes }
    };
  });

  const workReport = await db.workReport.update({
    where: { id: workReportId },
    data: {
      attendances: {
        upsert: attendanceUpserts,
      },
    },
  });

  return workReport;
}

export async function createContract(values: z.infer<typeof ContractSchema>) {
  await db.contract.create({
    data: {
      ...values,
      closingDay: values.closingDay ? parseInt(values.closingDay as string) : null,
    },
  });
} 

export async function searchContracts(userId: string, searchQuery: string) {
  const contracts = await db.contract.findMany({
    where: {
      AND: [ 
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { userId: userId },
      ],
    },
  });
  return contracts;
}

export async function updateContract(id: string, values: z.infer<typeof ContractSchema>) {
  await db.contract.update({
    where: { id },
    data: {
      ...values,
      closingDay: values.closingDay ? parseInt(values.closingDay as string) : null,
    },
  });
} 

export async function deleteContract(id: string) {
  await db.contract.delete({
    where: { id },
  });
} 

export async function getWorkReportsByContractId(contractId: string) {
  const workReports = await db.workReport.findMany({
    where: { contractId },
  });
  return workReports;
}

export async function getContractsByUserId(userId: string) {
  const contracts = await db.contract.findMany({
    where: { userId },
  });
  return contracts;
}

export async function getContractById(contractId: string) {
  const contract = await db.contract.findUnique({
    where: { id: contractId },
  });
  return contract;
}

