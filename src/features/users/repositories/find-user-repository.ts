import type { PrismaClient } from "@prisma/client"
import type { User } from "@/shared/generated/prisma"
import prisma from "@/shared/lib/prisma/prisma"

export async function findUser(
  lineId: string,
  tx?: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
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
