"use server"

import { z } from "zod"
import { groupPlayersByTeamId } from "@/features/players/utils/players"
import { createUserPlayers } from "@/features/user-players/repositories/create-user-players-repository"
import { deleteUserPlayersByUserId } from "@/features/user-players/repositories/delete-user-players-repository"
import { fetchUserPlayersByUserId } from "@/features/user-players/repositories/fetch-user-playres-repository"
import { createUser } from "@/features/users/repositories/create-user-repository"
import { findUser } from "@/features/users/repositories/find-user-repository"
import { verifyLineTokenApi } from "@/shared/api/line-api"
import { fetchPlayersByIdsApi } from "@/shared/api/mlb-api"
import { ERROR_CODE } from "@/shared/constants/error"
import prisma from "@/shared/lib/prisma/prisma"
import type { ActionResponse } from "@/shared/types/action"
import type { Player } from "@/shared/types/player"
import type { Team } from "@/shared/types/team"
import {
  generateActionErrorResponse,
  generateActionSuccessResponse,
} from "@/shared/utils/action"
import { CustomError } from "@/shared/utils/error"

type RegisterPitchersActionRequest = {
  lineIdToken: string
  selectedPlayerIds: Player["id"][]
}

type RegisterPitchersActionResponse = {
  registeredPlayersGroupedByTeamId: Record<Team["id"], Player[]>
}

/**
 * ピッチャー登録アクション
 */
export async function registerPitchersAction(
  request: RegisterPitchersActionRequest,
): Promise<ActionResponse<RegisterPitchersActionResponse>> {
  try {
    // リクエストボディ取得
    const schema = z.object({
      lineIdToken: z.string(),
      selectedPlayerIds: z.array(z.number()),
    })
    const parsedRequest = schema.safeParse(request)
    if (!parsedRequest.success) {
      throw new CustomError(
        ERROR_CODE.BAD_REQUEST,
        "Invalid request",
        z.treeifyError(parsedRequest.error),
      )
    }
    const { lineIdToken, selectedPlayerIds } = parsedRequest.data

    // LINE ID取得
    const lineVerifyData = await verifyLineTokenApi(lineIdToken)
    const lineId = lineVerifyData.sub

    // DBトランザクション
    const registeredPlayersGroupedByTeamId = await prisma.$transaction(
      async (tx) => {
        // ユーザー取得 or 作成
        const user =
          (await findUser(lineId, tx)) ?? (await createUser(lineId, tx))

        // ユーザーと選手の紐づけを更新
        await deleteUserPlayersByUserId(user.id, tx)
        if (selectedPlayerIds.length > 0) {
          await createUserPlayers(user.id, selectedPlayerIds, tx)
        }

        // ユーザーと選手の紐づけを取得
        const userPlayers = await fetchUserPlayersByUserId(user.id, tx)

        // ユーザーと選手の紐づけの選手IDを取得
        const playerIds = userPlayers.map((userPlayer) => userPlayer.playerId)

        // 選手データをMLB APIから取得
        const players = await fetchPlayersByIdsApi(playerIds)

        // 選手をチームIDでグループ化
        const registeredPlayersGroupedByTeamId = groupPlayersByTeamId(players)

        return registeredPlayersGroupedByTeamId
      },
    )

    return generateActionSuccessResponse({
      registeredPlayersGroupedByTeamId,
    })
  } catch (error) {
    return generateActionErrorResponse(
      "pitchers-registration-action:registerPitchersAction",
      "Failed to register pitchers",
      error,
    )
  }
}
