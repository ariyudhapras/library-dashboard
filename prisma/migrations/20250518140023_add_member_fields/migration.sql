/*
  Warnings:

  - A unique constraint covering the columns `[memberId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "memberId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- Update existing records with default values
UPDATE "User" SET "memberId" = 'M' || LPAD(id::TEXT, 4, '0') WHERE "memberId" IS NULL;

-- Make memberId NOT NULL after setting values
ALTER TABLE "User" ALTER COLUMN "memberId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");
