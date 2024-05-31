-- CreateTable
CREATE TABLE "Worktime" (
    "id" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Worktime_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Worktime" ADD CONSTRAINT "Worktime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
