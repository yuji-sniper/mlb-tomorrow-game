-- DropIndex
DROP INDEX "public"."UserPlayers_userId_idx";

-- CreateTable
CREATE TABLE "public"."Player" (
    "id" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "position" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_personId_key" ON "public"."Player"("personId");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "public"."Player"("teamId");

-- CreateIndex
CREATE INDEX "Player_position_idx" ON "public"."Player"("position");

-- AddForeignKey
ALTER TABLE "public"."UserPlayers" ADD CONSTRAINT "UserPlayers_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
