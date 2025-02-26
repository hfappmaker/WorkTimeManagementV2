import { db } from "@/lib/db";
import { WorkReportStatus, Prisma } from "@prisma/client";
import { UserProjectSchema } from "@/schemas";
import { z } from "zod";

interface AttendanceEntry {
  start: string;
  end: string;
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
  userProjectId: string
) {
  const workReport = await db.workReport.findFirst({
    where: {
      userProjectId: userProjectId,
      status: {
        notIn: [WorkReportStatus.COMPLETED, WorkReportStatus.APPROVED, WorkReportStatus.REJECTED],
      },
    },  
  });

  return workReport;
}

export async function createProject(
  name: string,
  startDate: Date,
  endDate: Date | null
) {
  const project = await db.project.create({
    data: {
      name: name,
      startDate: startDate,
      endDate: endDate,
    },
  });

  return project;
}

export async function createWorkReport(
  userProjectId: string,
  startDate: Date,
  endDate: Date
) {
  const workReport = await db.workReport.create({
    data: {
      userProjectId: userProjectId,
      startDate: startDate,
      endDate: endDate,
    },
  });

  return workReport;
}

export async function updateWorkReportAttendances(
  workReportId: string,
  attendance: AttendanceFormValues
) {
  const attendanceUpserts = Object.entries(attendance).map(([date, { start, end }]) => {
    const parsedDate = new Date(date);
    const startTime = start ? new Date(`${date}T${start}:00.000Z`) : null;
    const endTime = end ? new Date(`${date}T${end}:00.000Z`) : null;
    return {
      where: { date_workReportId: { date: parsedDate, workReportId } },
      update: { startTime , endTime },
      create: { date: parsedDate, startTime, endTime }
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

export async function deleteProject(projectId: string) {
  await db.project.delete({
    where: {
      id: projectId,
    },
  });
}

export async function unassignUserFromProject(userId: string, projectId: string) {
  await db.userProject.delete({
    where: {
      userId_projectId: { userId, projectId },
    },
  });
} 

export async function assignUserToProject(values: z.infer<typeof UserProjectSchema>) {
  await db.userProject.create({
    data: {
      userId: values.userId,
      projectId: values.projectId, 
      unitPrice: values.unitPrice ? new Prisma.Decimal(values.unitPrice) : null,
      settlementMin: values.settlementMin ? new Prisma.Decimal(values.settlementMin) : null,
      settlementMax: values.settlementMax ? new Prisma.Decimal(values.settlementMax) : null,
      upperRate: values.upperRate ? new Prisma.Decimal(values.upperRate) : null,
      middleRate: values.middleRate ? new Prisma.Decimal(values.middleRate) : null,
      workReportPeriodUnit: values.workReportPeriodUnit,
    },
  });
}

export async function getUnassignedProjects(userId: string) {
  const userProjects = await db.userProject.findMany({
    where: { userId },
  });
  const assignedProjectIds = userProjects.map((userProject) => userProject.projectId);
  const unassignedProjects = await db.project.findMany({  
    where: {
      NOT: {
        id: { in: assignedProjectIds },
      },
    },
  });
  return unassignedProjects;
}

export async function getAssignedProjects(userId: string) {
  const userProjects = await db.userProject.findMany({
    where: { userId },
    include: { project: true },
  });

  return userProjects.map((userProject) => userProject.project);
}

export const searchProjects = async (searchQuery: string) => {
  const projects = await db.project.findMany({
    where: {
      name: {
        contains: searchQuery,
        mode: "insensitive",
      },
    },
    include: {
      userProjects: true,
    },
  });
  return projects;
};

export async function updateProject(projectId: string, projectName: string) {
  await db.project.update({
    where: { id: projectId },
    data: { name: projectName },
  });
}

export async function getProjectById(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
  });
  return project;
}

export async function getUserProjects(userId: string) {
  const userProjects = await db.userProject.findMany({
    where: { userId },
    include: { project: true },
  });
  return userProjects;
}

export async function getUserProjectWorkReports(userProjectId: string) {
  const workReports = await db.workReport.findMany({
    where: { userProjectId },
    include: { attendances: true },
  });
  return workReports;
}

