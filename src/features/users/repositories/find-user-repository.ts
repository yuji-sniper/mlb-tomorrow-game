import prisma from "@/shared/lib/prisma/prisma";
import { PrismaClient } from "@prisma/client";
import { User } from "@/shared/generated/prisma";

export async function findUser(
  lineId: string,
  tx?: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>,
): Promise<User | null> {
  const prismaClient = tx || prisma;
  const user = await prismaClient.user.findUnique({
    where: {
      lineId,
    },
  });

  return user;
}
