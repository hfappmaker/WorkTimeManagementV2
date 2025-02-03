import { db } from "@/lib/db";

export async function getWorkTimesByWorkTimeReportId(workTimeReportId: string) {
  const workTimes = await db.workTime.findMany({
    where: {
      workTimeReportId: workTimeReportId,
    },
  });

  return workTimes;
}

export async function getOpenedWorkTimeReport(
  userProjectId: string
) {
  const workTimeReport = await db.workTimeReport.findFirst({
    where: {
      userProjectId: userProjectId,
      isClosed: false,
    },
  });

  return workTimeReport;
}

export async function getProjectsByUserId(userId: string) {
  const userProjects = await db.userProject.findMany({
    where: { userId },
    include: { project: true },
  });

  return userProjects.map((userProject) => userProject.project);
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
  const workTimeReport = await db.workTimeReport.create({
    data: {
      userProjectId: userProjectId,
      startDate: startDate,
      endDate: endDate,
    },
  });

  return workTimeReport;
}

export async function createWorkTime(
  startTime: Date,
  endTime: Date,
  workTimeReportId: string
) {
  const workTime = await db.workTime.create({
    data: {
      startTime: startTime,
      endTime: endTime,
      workTimeReportId: workTimeReportId,
    },
  });

  return workTime;
}

export async function updateWorkTime(
  id: string,
  startTime: Date,
  endTime: Date,
  workTimeReportId: string
) {
  const updatedWorkTime = await db.workTime.update({
    where: {
      id: id,
    },
    data: {
      startTime: startTime,
      endTime: endTime,
      workTimeReportId: workTimeReportId,
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

export async function assignUserToProject(userId: string, projectId: string, role: string) {
  await db.userProject.create({
    data: {
      userId: userId,
      projectId: projectId, 
      role: role,
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