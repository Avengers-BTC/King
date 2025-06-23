-- CreateTable
CREATE TABLE "DJRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DJRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanFollowing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanFollowing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DJRating_userId_djId_key" ON "DJRating"("userId", "djId");

-- CreateIndex
CREATE UNIQUE INDEX "FanFollowing_userId_djId_key" ON "FanFollowing"("userId", "djId");

-- AddForeignKey
ALTER TABLE "DJRating" ADD CONSTRAINT "DJRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DJRating" ADD CONSTRAINT "DJRating_djId_fkey" FOREIGN KEY ("djId") REFERENCES "DJ"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanFollowing" ADD CONSTRAINT "FanFollowing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanFollowing" ADD CONSTRAINT "FanFollowing_djId_fkey" FOREIGN KEY ("djId") REFERENCES "DJ"("id") ON DELETE CASCADE ON UPDATE CASCADE;
