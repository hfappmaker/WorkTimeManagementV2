"use server";
import {
  createProject,
  createWorkTime,
  createWorkTimeReport,
  deleteProject,
  getProjectsByUserId,
} from "@/data/work-time";
import { currentUser } from "@/lib/auth";
import { addDays, differenceInCalendarDays } from "date-fns";
import { revalidatePath } from "next/cache";

interface State {
  error?: string | undefined;
  success?: string | undefined;
}

const deleteAllProjectAndWorkTimeReport = async (prevState: State, formData: FormData) => {
  const user = await currentUser();
  const projects = await getProjectsByUserId(user.id);
  for (var project of projects) {
    await deleteProject(project.id);
  }
  revalidatePath("/dashborad");
  return { success: "All projects deleted successfully" };
}

const createProjectAndWorkTimeReport = async (prevState: State, formData: FormData) => {
  var newProjectName = formData.get("newProjectName")?.toString();
  if (!newProjectName) {
    return { error: "Project name is required" };
  }
  var startDate = new Date();
  const user = await currentUser();
  var project = await createProject(newProjectName, startDate, null);
  var endDate = addDays(startDate, 30);
  var workTimeReport = await createWorkTimeReport(
    user.id,
    project.id,
    startDate,
    endDate
  );
  const daysInPeriod = differenceInCalendarDays(endDate, startDate) + 1;
  const datesInPeriod = Array.from({ length: daysInPeriod }, (_, i) =>
    addDays(startDate, i)
  );
  for (var date of datesInPeriod) {
    await createWorkTime(date, date, workTimeReport.id);
  }
  
  revalidatePath("/dashborad");
  return { success: "Project created successfully"}
};

export {createProjectAndWorkTimeReport, deleteAllProjectAndWorkTimeReport};
