-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserTeams" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTeams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPlayers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlayers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_lineId_key" ON "public"."User"("lineId");

-- CreateIndex
CREATE INDEX "UserTeams_userId_idx" ON "public"."UserTeams"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTeams_userId_teamId_key" ON "public"."UserTeams"("userId", "teamId");

-- CreateIndex
CREATE INDEX "UserPlayers_userId_idx" ON "public"."UserPlayers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlayers_userId_playerId_key" ON "public"."UserPlayers"("userId", "playerId");

-- AddForeignKey
ALTER TABLE "public"."UserTeams" ADD CONSTRAINT "UserTeams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPlayers" ADD CONSTRAINT "UserPlayers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
