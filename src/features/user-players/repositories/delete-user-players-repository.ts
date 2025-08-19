import type { PrismaClient } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"

export async function deleteUserPlayersByUserId(
  userId: string,
  tx?: Omit<
    PrismaClient,
    "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use"
  >,
) {
  const prismaClient = tx || prisma
  await prismaClient.userPlayer.deleteMany({
    where: { userId },
  })
}
