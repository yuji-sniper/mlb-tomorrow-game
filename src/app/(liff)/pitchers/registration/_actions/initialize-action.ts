"use server"

import { z } from "zod"
import { groupPlayersByTeamId } from "@/features/players/utils/players"
import { fetchUserPlayersByUserId } from "@/features/user-players/repositories/fetch-user-playres-repository"
import { findUser } from "@/features/users/repositories/find-user-repository"
import { verifyLineTokenApi } from "@/shared/api/line-api"
import { fetchPlayersByIdsApi } from "@/shared/api/mlb-api"
import { ERROR_CODE } from "@/shared/constants/error"
import type { ActionResponse } from "@/shared/types/action"
import type { Player } from "@/shared/types/player"
import type { Team } from "@/shared/types/team"
import {
  generateActionErrorResponse,
  generateActionSuccessResponse,
} from "@/shared/utils/action"
import { CustomError } from "@/shared/utils/error"

type InitializeActionRequest = {
  lineIdToken: string
}

type InitializeActionResponse = {
  registeredPlayersByTeamId: Record<Team["id"], Player[]>
}

/**
 * ピッチャー登録画面の初期化アクション
 */
export async function initializeAction(
  request: InitializeActionRequest,
): Promise<ActionResponse<InitializeActionResponse>> {
  try {
    // リクエストパラメータ取得
    const schema = z.object({
      lineIdToken: z.string(),
    })
    const parsedRequest = schema.safeParse(request)
    if (!parsedRequest.success) {
      throw new CustomError(
        ERROR_CODE.BAD_REQUEST,
        "Invalid request",
        z.treeifyError(parsedRequest.error),
      )
    }
    const { lineIdToken } = parsedRequest.data

    // LINE IDトークンの検証
    const lineVerifyData = await verifyLineTokenApi(lineIdToken)
    const lineId = lineVerifyData.sub

    // ユーザー取得
    const user = await findUser(lineId)

    // ユーザーと選手の紐づけを取得
    const userPlayers = !user ? [] : await fetchUserPlayersByUserId(user.id)

    // 選手データをMLB APIから取得
    const playerIds = userPlayers.map((userPlayer) => userPlayer.playerId)
    const players = await fetchPlayersByIdsApi(playerIds)

    // 選手をチームIDでグループ化
    const registeredPlayersByTeamId = groupPlayersByTeamId(players)

    return generateActionSuccessResponse({
      registeredPlayersByTeamId,
    })
  } catch (error) {
    return generateActionErrorResponse(
      "pitchers-registration-form-action:initializeAction",
      "Failed to initialize pitchers registration form",
      error,
    )
  }
}
