import type { PrismaClient, User } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"

export async function createUser(
  lineId: string,
  tx?: Omit<
    PrismaClient,
    "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use"
  >,
): Promise<User> {
  const prismaClient = tx || prisma
  const user = await prismaClient.user.create({
    data: {
      lineId,
    },
  })

  return user
}
