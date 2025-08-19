import type { PrismaClient, User, UserPlayer } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"

export async function fetchUserPlayersByUserId(
  userId: User["id"],
  tx?: Omit<
    PrismaClient,
    "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use"
  >,
): Promise<UserPlayer[]> {
  const prismaClient = tx || prisma

  return await prismaClient.userPlayer.findMany({
    where: { userId },
  })
}
