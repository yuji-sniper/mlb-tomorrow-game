"use server";

import prisma from "@/shared/lib/prisma/prisma";
import { PrismaClient } from "@prisma/client";

export async function createUserTeamsAction(
  userId: string,
  teamIds: number[],
  tx?: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>,
) {
  const prismaClient = tx || prisma;
  await prismaClient.userTeams.createMany({
    data: teamIds.map((teamId) => ({
      userId,
      teamId,
    })), 
  });
}
