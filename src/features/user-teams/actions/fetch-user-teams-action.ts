"use server";

import { UserTeams } from "@/shared/generated/prisma";
import prisma from "@/shared/lib/prisma/prisma";
import { PrismaClient } from "@prisma/client";

export async function fetchUserTeamsByUserIdAction(
  userId: string,
  tx?: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>,
): Promise<UserTeams[]> {
  const prismaClient = tx || prisma;

  return await prismaClient.userTeams.findMany({
    where: { userId },
  });
}
