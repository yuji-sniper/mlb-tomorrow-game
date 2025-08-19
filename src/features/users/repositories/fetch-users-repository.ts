import type { PrismaClient } from "@prisma/client"
import type { User, UserPlayer, UserTeam } from "@/shared/generated/prisma"
import prisma from "@/shared/lib/prisma/prisma"

/**
 * ユーザー一覧を取得
 */
export async function* iterateAllUsersByChunkWithRelations(
  chunkSize: number = 100,
  relations: {
    players?: boolean
    teams?: boolean
  },
  tx?: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
  >,
): AsyncGenerator<
  (User & {
    players?: UserPlayer[]
    teams?: UserTeam[]
  })[],
  void,
  unknown
> {
  const prismaClient = tx || prisma

  const state: {
    cursor: { id: User["id"] } | undefined
  } = {
    cursor: undefined,
  }

  while (true) {
    const users = await prismaClient.user.findMany({
      take: chunkSize,
      ...(state.cursor ? { skip: 1, cursor: state.cursor } : {}),
      orderBy: {
        id: "asc",
      },
      include: relations,
    })

    if (users.length === 0) return

    yield users

    state.cursor = { id: users[users.length - 1].id }
  }
}
