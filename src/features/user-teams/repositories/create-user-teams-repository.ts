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
  try {
    const prismaClient = tx || prisma
    const userTeam = await prismaClient.userTeam.create({
      data: {
        userId,
        teamId,
      },
    })
    return userTeam
  } catch (error) {
    throw new Error(
      `[create-user-teams-repository:createUserTeamByUserIdAndTeamId](userId=${userId}, teamId=${teamId}) ${error}`,
    )
  }
}
