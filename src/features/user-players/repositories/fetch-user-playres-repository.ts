import type { PrismaClient } from "@prisma/client"
import type { User, UserPlayer } from "@/shared/generated/prisma"
import prisma from "@/shared/lib/prisma/prisma"

export async function fetchUserPlayersByUserId(
  userId: User["id"],
  tx?: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
  >,
): Promise<UserPlayer[]> {
  const prismaClient = tx || prisma

  return await prismaClient.userPlayer.findMany({
    where: { userId },
  })
}
