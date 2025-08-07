import prisma from "@/shared/lib/prisma/prisma";
import { PrismaClient } from "@prisma/client";

export async function createUserTeams(
  userId: string,
  teamIds: number[],
  tx?: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>,
) {
  const prismaClient = tx || prisma;
  await prismaClient.userTeam.createMany({
    data: teamIds.map((teamId) => ({
      userId,
      teamId,
    })), 
  });
}
