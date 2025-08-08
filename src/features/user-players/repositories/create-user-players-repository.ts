import type { PrismaClient } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"

export async function createUserPlayers(
  userId: string,
  playerIds: number[],
  tx?: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
  >,
) {
  const prismaClient = tx || prisma
  await prismaClient.userPlayer.createMany({
    data: playerIds.map((playerId) => ({
      userId,
      playerId,
    })),
  })
}
