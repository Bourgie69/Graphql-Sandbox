/*
  Warnings:

  - You are about to drop the column `schooldId` on the `Teacher` table. All the data in the column will be lost.
  - Added the required column `schoolId` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_schooldId_fkey";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "schooldId",
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
