/*
  Warnings:

  - You are about to drop the `Worktime` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Worktime" DROP CONSTRAINT "Worktime_userId_fkey";

-- DropTable
DROP TABLE "Worktime";

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProject" (
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "UserProject_pkey" PRIMARY KEY ("userId","projectId")
);

-- CreateTable
CREATE TABLE "WorkTime" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "userProjectUserId" TEXT NOT NULL,
    "userProjectProjectId" TEXT NOT NULL,

    CONSTRAINT "WorkTime_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTime" ADD CONSTRAINT "WorkTime_userProjectUserId_userProjectProjectId_fkey" FOREIGN KEY ("userProjectUserId", "userProjectProjectId") REFERENCES "UserProject"("userId", "projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
