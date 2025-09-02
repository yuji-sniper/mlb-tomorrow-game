import type { PrismaClient, UserTeam } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"

export async function createUserTeamByUserIdAndTeamId(
  userId: string,
  teamId: number,
  tx?: Omit<
    PrismaClient,
    "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use"
  >,
): Promise<UserTeam> {
  const prismaClient = tx || prisma
  const userTeam = await prismaClient.userTeam.create({
    data: {
      userId,
      teamId,
    },
  })
  return userTeam
}
