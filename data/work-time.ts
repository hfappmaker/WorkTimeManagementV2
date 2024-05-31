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

export const getWorkTimesByUserId = async (userId: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectId = async (projectId: string) => { 
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndDate = async (userId: string, date: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndDate = async (projectId: string, date: string) => {  
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndDateRange = async (userId: string, projectId: string, startDate: string, endDate: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndDateRange = async (userId: string, startDate: Date, endDate: Date) => { 
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndDateRange = async (projectId: string, startDate: string, endDate: string) => { 
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByDateRange = async (startDate: string, endDate: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndDate = async (userId: string, projectId: string, date: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndMonth = async (userId: string, projectId: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndMonth = async (userId: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndMonth = async (projectId: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByMonth = async (month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        startTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndYear = async (userId: string, projectId: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndYear = async (userId: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndYear = async (projectId: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByYear = async (year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        startTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndDateAndMonth = async (userId: string, projectId: string, date: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndDateAndMonth = async (userId: string, date: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndDateAndMonth = async (projectId: string, date: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByDateAndMonth = async (date: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndDateAndYear = async (userId: string, projectId: string, date: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndDateAndYear = async (userId: string, date: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndDateAndYear = async (projectId: string, date: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByDateAndYear = async (date: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndMonthAndYear = async (userId: string, projectId: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: month,
          lte: month,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndMonthAndYear = async (userId: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: month,
          lte: month,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndMonthAndYear = async (projectId: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: month,
          lte: month,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByMonthAndYear = async (month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        startTime: {
          gte: month,
          lte: month,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndDateRangeAndMonth = async (userId: string, projectId: string, startDate: string, endDate: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndDateRangeAndMonth = async (userId: string, startDate: string, endDate: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndDateRangeAndMonth = async (projectId: string, startDate: string, endDate: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByDateRangeAndMonth = async (startDate: string, endDate: string, month: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndDateRangeAndYear = async (userId: string, projectId: string, startDate: string, endDate: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}


export const getWorkTimesByUserIdAndDateRangeAndYear = async (userId: string, startDate: string, endDate: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndDateRangeAndYear = async (projectId: string, startDate: string, endDate: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByDateRangeAndYear = async (startDate: string, endDate: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const updateWorkTime = async (id: string, data: { startTime: string, endTime: string }) => {
  try {
    const workTime = await db.workTime.update({
      where: { id },
      data,
    });

    return workTime;
  } catch {
    return null;
  }
}

export const deleteWorkTime = async (id: string) => {
  try {
    const workTime = await db.workTime.delete({
      where: { id },
    });

    return workTime;
  } catch {
    return null;
  }
} 

export const createWorkTime = async (data: { startTime: string, endTime: string, userProjectUserId: string, userProjectProjectId: string }) => {
  try {
    const workTime = await db.workTime.create({
      data,
    });

    return workTime;
  } catch {
    return null;
  }
}

export const createWorkTimes = async (data: { startTime: string, endTime: string, userProjectUserId: string, userProjectProjectId: string }[]) => {
  try {
    const workTimes = await db.workTime.createMany({
      data,
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserId = async (userId: string) => {  
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByProjectId = async (projectId: string) => {  
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndProjectId = async (userId: string, projectId: string) => {   
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndDate = async (userId: string, date: string) => {  
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByProjectIdAndDate = async (projectId: string, date: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndDateRange = async (userId: string, startDate: string, endDate: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByProjectIdAndDateRange = async (projectId: string, startDate: string, endDate: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByDateRange = async (startDate: string, endDate: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndProjectIdAndDate = async (userId: string, projectId: string, date: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndProjectIdAndMonth = async (userId: string, projectId: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndMonth = async (userId: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByProjectIdAndMonth = async (projectId: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByMonth = async (month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        startTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndProjectIdAndYear = async (userId: string, projectId: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndYear = async (userId: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
} 

export const deleteWorkTimesByProjectIdAndYear = async (projectId: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByYear = async (year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        startTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
} 

export const deleteWorkTimesByUserIdAndProjectIdAndDateAndMonth = async (userId: string, projectId: string, date: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndDateAndMonth = async (userId: string, date: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByProjectIdAndDateAndMonth = async (projectId: string, date: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByDateAndMonth = async (date: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndProjectIdAndDateAndYear = async (userId: string, projectId: string, date: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndDateAndYear = async (userId: string, date: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByProjectIdAndDateAndYear = async (projectId: string, date: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByDateAndYear = async (date: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndProjectIdAndMonthAndYear = async (userId: string, projectId: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: month,
          lte: month,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndMonthAndYear = async (userId: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: month,
          lte: month,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
} 

export const deleteWorkTimesByProjectIdAndMonthAndYear = async (projectId: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: month,
          lte: month,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByMonthAndYear = async (month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        startTime: {
          gte: month,
          lte: month,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndProjectIdAndDateRangeAndMonth = async (userId: string, projectId: string, startDate: string, endDate: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndDateRangeAndMonth = async (userId: string, startDate: string, endDate: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByProjectIdAndDateRangeAndMonth = async (projectId: string, startDate: string, endDate: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByDateRangeAndMonth = async (startDate: string, endDate: string, month: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndProjectIdAndDateRangeAndYear = async (userId: string, projectId: string, startDate: string, endDate: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndDateRangeAndYear = async (userId: string, startDate: string, endDate: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByProjectIdAndDateRangeAndYear = async (projectId: string, startDate: string, endDate: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByDateRangeAndYear = async (startDate: string, endDate: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: year,
          lte: year,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimeById = async (id: string) => {
  try {
    const workTime = await db.workTime.findUnique({
      where: { id },
    });

    return workTime;
  } catch {
    return null;
  }
}

export const getWorkTimes = async () => {
  try {
    const workTimes = await db.workTime.findMany();

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndDateAndMonthAndYear = async (userId: string, projectId: string, date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndDateAndMonthAndYear = async (userId: string, date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndDateAndMonthAndYear = async (projectId: string, date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByDateAndMonthAndYear = async (date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndProjectIdAndDateAndMonthAndYearRange = async (userId: string, projectId: string, date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByUserIdAndDateAndMonthAndYearRange = async (userId: string, date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectUserId: userId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByProjectIdAndDateAndMonthAndYearRange = async (projectId: string, date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const getWorkTimesByDateAndMonthAndYearRange = async (date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.findMany({
      where: {
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndProjectIdAndDateAndMonthAndYear = async (userId: string, projectId: string, date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndDateAndMonthAndYear = async (userId: string, date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByProjectIdAndDateAndMonthAndYear = async (projectId: string, date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByDateAndMonthAndYear = async (date: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        startTime: date,
        endTime: date,
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndProjectIdAndDateRangeAndMonthAndYear = async (userId: string, projectId: string, startDate: string, endDate: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByUserIdAndDateRangeAndMonthAndYear = async (userId: string, startDate: string, endDate: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectUserId: userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByProjectIdAndDateRangeAndMonthAndYear = async (projectId: string, startDate: string, endDate: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        userProjectProjectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const deleteWorkTimesByDateRangeAndMonthAndYear = async (startDate: string, endDate: string, month: string, year: string) => {
  try {
    const workTimes = await db.workTime.deleteMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          gte: month,
          lte: month,
        },
      },
    });

    return workTimes;
  } catch {
    return null;
  }
}

export const createWorkTimesByUserIdAndProjectIdAndDateRangeAndYear = async (userId: string, projectId: string, startDate: string, endDate: string, year: string) => {
  try {
    const workTimes = await db.workTime.createMany({
      data: Array.from({ length: 7 }, (_, i) => ({
        startTime: startDate,
        endTime: endDate,
        userProjectUserId: userId,
        userProjectProjectId: projectId,
      })),
    });

    return workTimes;
  } catch {
    return null;
  }
}



