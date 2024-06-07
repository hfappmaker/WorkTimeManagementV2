"use server";
import { createProject, createWorkTimeReport } from '@/data/work-time';
import { currentUser } from '@/lib/auth';
import { addDays } from 'date-fns';
import { revalidatePath } from 'next/cache';

const formAction = async (formData: FormData) => {
    'use server';
    var newProjectName = formData.get('newProjectName')?.toString();
    if (!newProjectName) {
      return;
    }
    var startDate = new Date();
    const user = await currentUser();
    var project = await createProject(newProjectName, startDate, null);
    var endDate = addDays(startDate, 30);
    await createWorkTimeReport(user.id, project.id, startDate, endDate);
    revalidatePath("/dashborad");
}

export default formAction;