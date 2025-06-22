/*
  Warnings:

  - You are about to drop the column `genre` on the `DJ` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DJStatus" AS ENUM ('OFFLINE', 'PERFORMING', 'SCHEDULED', 'ON_BREAK');

-- CreateEnum
CREATE TYPE "AffiliationType" AS ENUM ('RESIDENT', 'GUEST', 'FEATURED');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "openingHours" JSONB;

-- AlterTable
ALTER TABLE "DJ" DROP COLUMN "genre",
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "status" "DJStatus" NOT NULL DEFAULT 'OFFLINE';

-- CreateTable
CREATE TABLE "DJSchedule" (
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

    CONSTRAINT "DJSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DJPerformanceHistory" (
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

    CONSTRAINT "DJPerformanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DJClubAffiliation" (
    "id" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "type" "AffiliationType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DJClubAffiliation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DJSchedule" ADD CONSTRAINT "DJSchedule_djId_fkey" FOREIGN KEY ("djId") REFERENCES "DJ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DJSchedule" ADD CONSTRAINT "DJSchedule_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DJPerformanceHistory" ADD CONSTRAINT "DJPerformanceHistory_djId_fkey" FOREIGN KEY ("djId") REFERENCES "DJ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DJPerformanceHistory" ADD CONSTRAINT "DJPerformanceHistory_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DJClubAffiliation" ADD CONSTRAINT "DJClubAffiliation_djId_fkey" FOREIGN KEY ("djId") REFERENCES "DJ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DJClubAffiliation" ADD CONSTRAINT "DJClubAffiliation_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
