"use server"

import { z } from "zod"
import { createUserTeamByUserIdAndTeamId } from "@/features/user-teams/repositories/create-user-teams-repository"
import { findUserTeamByUserIdAndTeamId } from "@/features/user-teams/repositories/find-user-team-repository"
import { createUser } from "@/features/users/repositories/create-user-repository"
import { findUser } from "@/features/users/repositories/find-user-repository"
import { verifyLineTokenApi } from "@/shared/api/line-api"
import { ERROR_CODE } from "@/shared/constants/error"
import prisma from "@/shared/lib/prisma/prisma"
import type { ActionResponse } from "@/shared/types/action"
import type { Team } from "@/shared/types/team"
import {
  generateActionErrorResponse,
  generateActionSuccessResponse,
} from "@/shared/utils/action"
import { CustomError } from "@/shared/utils/error"

type RegisterTeamActionRequest = {
  lineIdToken: string
  teamId: Team["id"]
}

type RegisterTeamActionResponse = {}

/**
 * チーム登録アクション
 */
export async function registerTeamAction(
  request: RegisterTeamActionRequest,
): Promise<ActionResponse<RegisterTeamActionResponse>> {
  try {
    // リクエストボディ取得
    const schema = z.object({
      lineIdToken: z.string(),
      teamId: z.number(),
    })
    const parsedRequest = schema.safeParse(request)
    if (!parsedRequest.success) {
      throw new CustomError(
        ERROR_CODE.BAD_REQUEST,
        "Invalid request",
        z.treeifyError(parsedRequest.error),
      )
    }
    const { lineIdToken, teamId } = parsedRequest.data

    // LINE ID取得
    const lineVerifyData = await verifyLineTokenApi(lineIdToken)
    const lineId = lineVerifyData.sub

    // DBトランザクション
    await prisma.$transaction(async (tx) => {
      // ユーザー取得 or 作成
      const user =
        (await findUser(lineId, tx)) ?? (await createUser(lineId, tx))

      // ユーザーとチームの紐づけを取得
      const userTeam = await findUserTeamByUserIdAndTeamId(user.id, teamId, tx)

      // ユーザーとチームの紐づけが存在しない場合は作成
      if (!userTeam) {
        await createUserTeamByUserIdAndTeamId(user.id, teamId, tx)
      }
    })

    return generateActionSuccessResponse(
      "teams-registration-action:registerTeamAction",
      "Success to register team",
      {},
    )
  } catch (error) {
    return generateActionErrorResponse(
      "teams-registration-action:registerTeamAction",
      "Failed to register team",
      error,
    )
  }
}
