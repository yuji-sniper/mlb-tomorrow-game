/*
  Warnings:

  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserPlayers" DROP CONSTRAINT "UserPlayers_playerId_fkey";

-- DropTable
DROP TABLE "public"."Player";
