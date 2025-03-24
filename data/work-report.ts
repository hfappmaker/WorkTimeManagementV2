import { db } from "@/lib/db";
import { WorkReportStatus } from "@prisma/client";
import { Attendance } from "@/types/attendance";

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
  targetDate: Date
) {
  const workReport = await db.workReport.create({
    data: {
      contractId: contractId,
      targetDate: targetDate,
    },
  });

  return workReport;
}

export async function updateWorkReportAttendances(
  workReportId: string,
  attendances: Attendance[]
) {
  const attendanceUpserts = Object.entries(attendances).map(
    ([date, { startTime, endTime, breakDuration, memo }]) => {
      const [year, month, day] = date.split('/').map(Number);
      const parsedDate = new Date(Date.UTC(year, month - 1, day));

      return {
        where: { date_workReportId: { date: parsedDate, workReportId } },
        update: {
          startTime: startTime ?? null,
          endTime: endTime ?? null,
          breakDuration: breakDuration ?? null,
          memo: memo ?? null,
        },
        create: { 
          date: parsedDate,
          startTime: startTime ?? null,
          endTime: endTime ?? null,
          breakDuration: breakDuration ?? null,
          memo: memo ?? null,
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

export async function updateWorkReportAttendance(
  workReportId: string,
  date: Date,
  attendance: Attendance
) {
  const updatedAttendance = await db.attendance.upsert({
    where: { date_workReportId: { date, workReportId } },
    update: {
      startTime: attendance.startTime ?? null,
      endTime: attendance.endTime ?? null,
      breakDuration: attendance.breakDuration ?? null,
      memo: attendance.memo ?? null,
    },
    create: {
      date,
      workReportId,
      startTime: attendance.startTime ?? null,
      endTime: attendance.endTime ?? null,
      breakDuration: attendance.breakDuration ?? null,
      memo: attendance.memo ?? null,
    },
  });

  return updatedAttendance;
}

export async function getWorkReportsByContractId(contractId: string) {
  const workReports = await db.workReport.findMany({
    where: { contractId },
  });
  return workReports;
}

export async function getWorkReportsByContractIdAndYearMonthDateRange(
  contractId: string,
  fromDate?: Date,
  toDate?: Date
) {
  const workReports = await db.workReport.findMany({
    where: {
      contractId,
      targetDate: { gte: fromDate, lte: toDate },
    },
    orderBy: {
      targetDate: 'asc'
    }
  });
  return workReports;
}

export async function getCurrentWorkReports() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = new Date(currentYear, currentMonth, 1);
  const workReports = await db.workReport.findMany({
    where: {
      targetDate: currentDate,
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
  const groupedReports = workReports.reduce(
    (acc, report) => {
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
        targetDate: report.targetDate,
        status: report.status,
      });

      return acc;
    },
    {} as Record<
      string,
      {
        clientName: string;
        contracts: Record<
          string,
          {
            contractName: string;
            workReports: Array<{
              id: string;
              targetDate: Date;
              status: string;
            }>;
          }
        >;
      }
    >
  );

  return groupedReports;
}
