import { PrismaClient } from "@prisma/client";
import prisma from "@/shared/lib/prisma/prisma";
import { User, UserPlayer } from "@/shared/generated/prisma";

export async function fetchUserPlayersByUserId(
  userId: User['id'],
  tx?: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>,
): Promise<UserPlayer[]> {
  const prismaClient = tx || prisma;

  return await prismaClient.userPlayer.findMany({
    where: { userId },
  });
}
