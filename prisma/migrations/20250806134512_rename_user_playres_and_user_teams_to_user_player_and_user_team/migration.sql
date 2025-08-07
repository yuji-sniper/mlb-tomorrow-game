/*
  Warnings:

  - You are about to drop the `UserPlayers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserTeams` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserPlayers" DROP CONSTRAINT "UserPlayers_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserTeams" DROP CONSTRAINT "UserTeams_userId_fkey";

-- DropTable
DROP TABLE "public"."UserPlayers";

-- DropTable
DROP TABLE "public"."UserTeams";

-- CreateTable
CREATE TABLE "public"."UserTeam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPlayer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTeam_userId_idx" ON "public"."UserTeam"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTeam_userId_teamId_key" ON "public"."UserTeam"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlayer_userId_playerId_key" ON "public"."UserPlayer"("userId", "playerId");

-- AddForeignKey
ALTER TABLE "public"."UserTeam" ADD CONSTRAINT "UserTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPlayer" ADD CONSTRAINT "UserPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
