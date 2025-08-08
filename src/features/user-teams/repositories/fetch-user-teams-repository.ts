import type { PrismaClient } from "@prisma/client"
import type { User, UserTeam } from "@/shared/generated/prisma"
import prisma from "@/shared/lib/prisma/prisma"

export async function fetchUserTeamsByUserId(
  userId: User["id"],
  tx?: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
  >,
): Promise<UserTeam[]> {
  const prismaClient = tx || prisma

  return await prismaClient.userTeam.findMany({
    where: { userId },
  })
}
