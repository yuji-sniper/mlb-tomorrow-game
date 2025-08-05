import prisma from "@/shared/lib/prisma/prisma";
import { PrismaClient } from "@prisma/client";
import { User } from "@/shared/generated/prisma";

export async function findOrCreateUserAction(
  lineId: string,
  tx?: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>,
): Promise<User | null> {
  const prismaClient = tx || prisma;
  const user = await findUserAction(lineId, prismaClient)
    ? await findUserAction(lineId, prismaClient)
    : await createUserAction(lineId, prismaClient);

  return user;
}

export async function findUserAction(
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

async function createUserAction(
  lineId: string,
  tx?: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>,
): Promise<User> {
  const prismaClient = tx || prisma;
  const user = await prismaClient.user.create({
    data: {
      lineId,
    },
  });

  return user;
}
