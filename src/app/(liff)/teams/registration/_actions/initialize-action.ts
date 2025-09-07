"use server"

import { z } from "zod"
import { fetchUserTeamsByUserId } from "@/features/user-teams/repositories/fetch-user-teams-repository"
import { findUser } from "@/features/users/repositories/find-user-repository"
import { verifyLineTokenApi } from "@/shared/api/line-api"
import { ERROR_CODE } from "@/shared/constants/error"
import type { ActionResponse } from "@/shared/types/action"
import {
  generateActionErrorResponse,
  generateActionSuccessResponse,
} from "@/shared/utils/action"
import { CustomError } from "@/shared/utils/error"

type InitializeActionRequest = {
  lineIdToken: string
}

type InitializeActionResponse = {
  registeredTeamIds: number[]
}

/**
 * チーム登録画面の初期化アクション
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

    // ユーザーとチームの紐づけを取得
    const userTeams = !user ? [] : await fetchUserTeamsByUserId(user.id)

    // ユーザーとチームの紐づけのチームIDを取得
    const registeredTeamIds = userTeams.map((userTeam) => userTeam.teamId)

    return generateActionSuccessResponse(
      "teams-registration-action:initializeAction",
      "Success to initialize teams registration",
      {
        registeredTeamIds,
      },
    )
  } catch (error) {
    return generateActionErrorResponse(
      "teams-registration-action:initializeAction",
      "Failed to initialize teams registration",
      error,
    )
  }
}
