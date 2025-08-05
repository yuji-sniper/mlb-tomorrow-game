/*
  Warnings:

  - Changed the type of `playerId` on the `UserPlayers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."UserPlayers" DROP COLUMN "playerId",
ADD COLUMN     "playerId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserPlayers_userId_playerId_key" ON "public"."UserPlayers"("userId", "playerId");
