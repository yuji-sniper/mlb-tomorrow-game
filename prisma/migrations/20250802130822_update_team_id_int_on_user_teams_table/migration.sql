/*
  Warnings:

  - Changed the type of `teamId` on the `UserTeams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."UserTeams" DROP COLUMN "teamId",
ADD COLUMN     "teamId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserTeams_userId_teamId_key" ON "public"."UserTeams"("userId", "teamId");
