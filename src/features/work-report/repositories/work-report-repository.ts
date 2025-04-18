import { WorkReportStatus } from "@prisma/client";

import { AttendanceDto } from "@/features/work-report/types/attendance";
import { db } from "@/repositories/db";

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
          WorkReportStatus.SUBMITTED,
          WorkReportStatus.APPROVED,
          WorkReportStatus.REJECTED,
        ],
      },
    },
  });

  return workReport;
}

export async function createWorkReport(contractId: string, targetDate: Date) {
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
  attendances: AttendanceDto[],
) {
  const attendanceUpserts = attendances.map(
    ({ date, startTime, endTime, breakDuration, memo }) => {
      return {
        where: { date_workReportId: { date, workReportId } },
        update: {
          startTime: startTime ?? null,
          endTime: endTime ?? null,
          breakDuration: breakDuration ?? null,
          memo: memo ?? null,
        },
        create: {
          date,
          startTime: startTime ?? null,
          endTime: endTime ?? null,
          breakDuration: breakDuration ?? null,
          memo: memo ?? null,
        },
      };
    },
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

export async function getWorkReportsByContractIdAndYearMonthDateRange(
  contractId: string,
  fromDate?: Date,
  toDate?: Date,
) {
  const workReports = await db.workReport.findMany({
    where: {
      contractId,
      targetDate: { gte: fromDate, lte: toDate },
    },
    orderBy: {
      targetDate: "asc",
    },
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
  const groupedReports = workReports.reduce<
    Record<
      string,
      {
        clientName: string;
        contracts: Record<
          string,
          {
            contractName: string;
            workReports: {
              id: string;
              targetDate: Date;
              status: WorkReportStatus;
            }[];
          }
        >;
      }
    >
  >((acc, report) => {
    const clientId = report.contract.clientId;
    const contractId = report.contractId;

    acc[clientId] = acc[clientId] ?? {
      clientName: report.contract.client.name,
      contracts: {},
    };

    acc[clientId].contracts[contractId] = acc[clientId].contracts[
      contractId
    ] ?? {
      contractName: report.contract.name,
      workReports: [],
    };

    acc[clientId].contracts[contractId].workReports.push({
      id: report.id,
      targetDate: report.targetDate,
      status: report.status,
    });

    return acc;
  }, {});

  return groupedReports;
}
