import { db } from "@/lib/db";
import { WorkReportStatus } from "@prisma/client";

export async function getWorkTimesByWorkTimeReportId(workTimeReportId: string) {
  const workTimes = await db.workTime.findMany({
    where: {
      workReportId: workTimeReportId,
    },
  });

  return workTimes;
}

export async function getOpenedWorkTimeReport(
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

export async function createWorkTimeReport(
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


export async function createWorkTime(
  startTime: Date,
  endTime: Date,
  workReportId: string
) {
  const workTime = await db.workTime.create({
    data: {
      startTime: startTime,

      endTime: endTime,
      workReportId: workReportId,

    },
  });

  return workTime;
}

export async function updateWorkTime(
  id: string,
  startTime: Date,
  endTime: Date,
  workReportId: string

) {
  const updatedWorkTime = await db.workTime.update({
    where: {
      id: id,
    },
    data: {
      startTime: startTime,
      endTime: endTime,
      workReportId: workReportId,

    },
  });
  return updatedWorkTime;
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

export async function assignUserToProject(userId: string, projectId: string) {
  await db.userProject.create({
    data: {
      userId: userId,
      projectId: projectId, 
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
