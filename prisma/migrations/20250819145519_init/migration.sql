-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_lineId_key" ON "public"."User"("lineId");

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
