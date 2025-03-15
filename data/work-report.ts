import { db } from "@/lib/db";
import { WorkReportStatus } from "@prisma/client";

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

export async function getOpenedWorkReport(contractId: string) {
  const workReport = await db.workReport.findFirst({
    where: {
      contractId: contractId,
      status: {
        notIn: [
          WorkReportStatus.COMPLETED,
          WorkReportStatus.APPROVED,
          WorkReportStatus.REJECTED,
        ],
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
  const attendanceUpserts = Object.entries(attendance).map(
    ([date, { start, end, breakDuration }]) => {
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
        create: {
          date: parsedDate,
          startTime,
          endTime,
          breakDuration: breakDurationMinutes,
        },
      };
    }
  );

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

export async function getWorkReportsByContractId(contractId: string) {
  const workReports = await db.workReport.findMany({
    where: { contractId },
  });
  return workReports;
}

export async function getCurrentWorkReports() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const workReports = await db.workReport.findMany({
    where: {
      year: currentYear,
      month: currentMonth,
    },
    include: {
      contract: {
        include: {
          client: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Group work reports by client and contract
  const groupedReports = workReports.reduce((acc, report) => {
    const clientId = report.contract.clientId;
    const contractId = report.contractId;

    if (!acc[clientId]) {
      acc[clientId] = {
        clientName: report.contract.client.name,
        contracts: {},
      };
    }

    if (!acc[clientId].contracts[contractId]) {
      acc[clientId].contracts[contractId] = {
        contractName: report.contract.name,
        workReports: [],
      };
    }

    acc[clientId].contracts[contractId].workReports.push({
      id: report.id,
      year: report.year,
      month: report.month,
      status: report.status,
      userName: report.contract.user.name || "",
    });

    return acc;
  }, {} as Record<string, {
    clientName: string;
    contracts: Record<string, {
      contractName: string;
      workReports: Array<{
        id: string;
        year: number;
        month: number;
        status: string;
        userName: string;
      }>;
    }>;
  }>);

  return groupedReports;
}
