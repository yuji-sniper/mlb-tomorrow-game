import type { PrismaClient } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"

export async function deleteUserPlayersByUserId(
  userId: string,
  tx?: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
  >,
) {
  const prismaClient = tx || prisma
  await prismaClient.userPlayer.deleteMany({
    where: { userId },
  })
}
