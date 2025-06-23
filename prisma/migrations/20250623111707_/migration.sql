/*
  Warnings:

  - You are about to drop the `DJ` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DJClubAffiliation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DJPerformanceHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DJRating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DJSchedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DJ" DROP CONSTRAINT "DJ_userId_fkey";

-- DropForeignKey
ALTER TABLE "DJClubAffiliation" DROP CONSTRAINT "DJClubAffiliation_clubId_fkey";

-- DropForeignKey
ALTER TABLE "DJClubAffiliation" DROP CONSTRAINT "DJClubAffiliation_djId_fkey";

-- DropForeignKey
ALTER TABLE "DJPerformanceHistory" DROP CONSTRAINT "DJPerformanceHistory_clubId_fkey";

-- DropForeignKey
ALTER TABLE "DJPerformanceHistory" DROP CONSTRAINT "DJPerformanceHistory_djId_fkey";

-- DropForeignKey
ALTER TABLE "DJRating" DROP CONSTRAINT "DJRating_djId_fkey";

-- DropForeignKey
ALTER TABLE "DJRating" DROP CONSTRAINT "DJRating_userId_fkey";

-- DropForeignKey
ALTER TABLE "DJSchedule" DROP CONSTRAINT "DJSchedule_clubId_fkey";

-- DropForeignKey
ALTER TABLE "DJSchedule" DROP CONSTRAINT "DJSchedule_djId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_djId_fkey";

-- DropForeignKey
ALTER TABLE "FanFollowing" DROP CONSTRAINT "FanFollowing_djId_fkey";

-- DropTable
DROP TABLE "DJ";

-- DropTable
DROP TABLE "DJClubAffiliation";

-- DropTable
DROP TABLE "DJPerformanceHistory";

-- DropTable
DROP TABLE "DJRating";

-- DropTable
DROP TABLE "DJSchedule";

-- CreateTable
CREATE TABLE "Dj" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genres" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fans" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "currentClub" TEXT,
    "status" "DJStatus" NOT NULL DEFAULT 'OFFLINE',
    "instagram" TEXT,
    "twitter" TEXT,
    "facebook" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dj_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DjSchedule" (
    "id" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DjSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DjPerformanceHistory" (
    "id" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT,
    "rating" DOUBLE PRECISION,
    "attendance" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DjPerformanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DjClubAffiliation" (
    "id" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "type" "AffiliationType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DjClubAffiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DjRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DjRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dj_userId_key" ON "Dj"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DjRating_userId_djId_key" ON "DjRating"("userId", "djId");

-- AddForeignKey
ALTER TABLE "Dj" ADD CONSTRAINT "Dj_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DjSchedule" ADD CONSTRAINT "DjSchedule_djId_fkey" FOREIGN KEY ("djId") REFERENCES "Dj"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DjSchedule" ADD CONSTRAINT "DjSchedule_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DjPerformanceHistory" ADD CONSTRAINT "DjPerformanceHistory_djId_fkey" FOREIGN KEY ("djId") REFERENCES "Dj"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DjPerformanceHistory" ADD CONSTRAINT "DjPerformanceHistory_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DjClubAffiliation" ADD CONSTRAINT "DjClubAffiliation_djId_fkey" FOREIGN KEY ("djId") REFERENCES "Dj"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DjClubAffiliation" ADD CONSTRAINT "DjClubAffiliation_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_djId_fkey" FOREIGN KEY ("djId") REFERENCES "Dj"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DjRating" ADD CONSTRAINT "DjRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DjRating" ADD CONSTRAINT "DjRating_djId_fkey" FOREIGN KEY ("djId") REFERENCES "Dj"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanFollowing" ADD CONSTRAINT "FanFollowing_djId_fkey" FOREIGN KEY ("djId") REFERENCES "Dj"("id") ON DELETE CASCADE ON UPDATE CASCADE;
