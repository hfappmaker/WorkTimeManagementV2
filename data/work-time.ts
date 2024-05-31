import { db } from "@/lib/db";

export const getWorkTimesByUserIdAndProjectId = async (
  userId: string,
  projectId: string
) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
};
