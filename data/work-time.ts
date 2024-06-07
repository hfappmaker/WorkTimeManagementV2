import { db } from "@/lib/db";

export async function getWorkTimesByWorkTimeReportId(workTimeReportId: string) {
  const workTimes = await db.workTime.findMany({
    where: {
      workTimeReportId: workTimeReportId,
    },
  });

  return workTimes;
}

export async function getOpenedWorkTimeReport(userId: string, projectId: string) {
  const workTimeReport = await db.workTimeReport.findFirst({
    where: {
      userId: userId,
      projectId: projectId,
      isClosed: false,
    },
  });

  return workTimeReport;
}

export async function getProjectsByUserId(userId: string) {
  const projectIdDatas = await db.workTimeReport.findMany({
    where: {
      userId: userId,
    },
    select: {
      projectId: true,
    },
    distinct: ['projectId'],
    orderBy: {
      isClosed: 'asc',
    },
  });

  const projects = await db.project.findMany({
    where: {
      id: {
        in: projectIdDatas.map((projectIdData) => projectIdData.projectId),
      },
    },
  });

  return projects;
}

export async function createProject(name: string, startDate: Date, endDate: Date | null) {
  const project = await db.project.create({
    data: {
      name: name,
      startDate: startDate,
      endDate: endDate,
    },
  });

  return project;
}

export async function createWorkTimeReport(userId: string, projectId: string, startDate: Date, endDate: Date) {
  const workTimeReport = await db.workTimeReport.create({
    data: {
      userId: userId,
      projectId: projectId,
      startDate: startDate,
      endDate: endDate,
    },
  });

  return workTimeReport;
}