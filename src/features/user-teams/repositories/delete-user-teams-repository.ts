import type { PrismaClient, User } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"
import type { Team } from "@/shared/types/team"

export async function deleteUserTeamByUserIdAndTeamId(
  userId: User["id"],
  teamId: Team["id"],
  tx?: Omit<
    PrismaClient,
    "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use"
  >,
) {
  try {
    const prismaClient = tx || prisma
    await prismaClient.userTeam.delete({
      where: { userId_teamId: { userId, teamId } },
    })
  } catch (error) {
    throw new Error(
      `[delete-user-teams-repository:deleteUserTeamByUserIdAndTeamId](userId=${userId}, teamId=${teamId}) ${error}`,
    )
  }
}
