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
    const startTime1 = performance.now()
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
    console.log("リクエストパラメータ取得", performance.now() - startTime1)

    // LINE IDトークンの検証
    const startTime2 = performance.now()
    const lineVerifyData = await verifyLineTokenApi(lineIdToken)
    const lineId = lineVerifyData.sub
    console.log("LINE IDトークンの検証", performance.now() - startTime2)

    // ユーザー取得
    const startTime3 = performance.now()
    const user = await findUser(lineId)
    console.log("ユーザー取得", performance.now() - startTime3)

    // ユーザーとチームの紐づけを取得
    const startTime4 = performance.now()
    const userTeams = !user ? [] : await fetchUserTeamsByUserId(user.id)
    console.log(
      "ユーザーとチームの紐づけを取得",
      performance.now() - startTime4,
    )

    // ユーザーとチームの紐づけのチームIDを取得
    const startTime5 = performance.now()
    const registeredTeamIds = userTeams.map((userTeam) => userTeam.teamId)
    console.log(
      "ユーザーとチームの紐づけのチームIDを取得",
      performance.now() - startTime5,
    )
    return generateActionSuccessResponse({
      registeredTeamIds,
    })
  } catch (error) {
    return generateActionErrorResponse(
      "teams-registration-action:initializeAction",
      "Failed to initialize teams registration",
      error,
    )
  }
}
