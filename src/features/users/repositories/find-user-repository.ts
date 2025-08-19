import type { PrismaClient, User } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"

export async function findUser(
  lineId: string,
  tx?: Omit<
    PrismaClient,
    "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use"
  >,
): Promise<User | null> {
  const prismaClient = tx || prisma
  const user = await prismaClient.user.findUnique({
    where: {
      lineId,
    },
  })

  return user
}
