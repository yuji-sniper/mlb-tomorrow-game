import type { PrismaClient, User, UserTeam } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"
import type { Team } from "@/shared/types/team"

export async function findUserTeamByUserIdAndTeamId(
  userId: User["id"],
  teamId: Team["id"],
  tx?: Omit<
    PrismaClient,
    "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use"
  >,
): Promise<UserTeam | null> {
  const prismaClient = tx || prisma
  const userTeam = await prismaClient.userTeam.findUnique({
    where: { userId_teamId: { userId, teamId } },
  })
  return userTeam
}
