import type { PrismaClient } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"

export async function createUserPlayers(
  userId: string,
  playerIds: number[],
  tx?: Omit<
    PrismaClient,
    "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use"
  >,
) {
  try {
    const prismaClient = tx || prisma
    await prismaClient.userPlayer.createMany({
      data: playerIds.map((playerId) => ({
        userId,
        playerId,
      })),
    })
  } catch (error) {
    throw new Error(
      `[create-user-players-repository:createUserPlayers](userId=${userId}, playerIds=${playerIds}) ${error}`,
    )
  }
}
