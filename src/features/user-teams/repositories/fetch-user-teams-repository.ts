import type { PrismaClient, User, UserTeam } from "@prisma/client"
import prisma from "@/shared/lib/prisma/prisma"

export async function fetchUserTeamsByUserId(
  userId: User["id"],
  tx?: Omit<
    PrismaClient,
    "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use"
  >,
): Promise<UserTeam[]> {
  const prismaClient = tx || prisma

  return await prismaClient.userTeam.findMany({
    where: { userId },
  })
}
