"use server";

import prisma from "@/shared/lib/prisma/prisma";
import { Prisma } from "@prisma/client";

export async function deleteUserTeamsByUserIdAction(
  userId: string,
  tx?: Prisma.TransactionClient,
) {
  const prismaClient = tx || prisma;
  await prismaClient.userTeams.deleteMany({
    where: { userId },
  });
}
