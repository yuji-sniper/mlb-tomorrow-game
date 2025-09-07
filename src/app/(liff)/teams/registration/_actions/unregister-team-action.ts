"use server"

import { z } from "zod"
import { deleteUserTeamByUserIdAndTeamId } from "@/features/user-teams/repositories/delete-user-teams-repository"
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

type UnregisterTeamActionRequest = {
  lineIdToken: string
  teamId: Team["id"]
}

type UnregisterTeamActionResponse = {}

export async function unregisterTeamAction(
  request: UnregisterTeamActionRequest,
): Promise<ActionResponse<UnregisterTeamActionResponse>> {
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
      // ユーザー取得
      const user = await findUser(lineId, tx)
      if (!user) {
        throw new CustomError(ERROR_CODE.NOT_FOUND, "User not found")
      }

      // ユーザーとチームの紐づけを削除
      await deleteUserTeamByUserIdAndTeamId(user.id, teamId, tx)
    })

    return generateActionSuccessResponse(
      "teams-registration-action:unregisterTeamAction",
      "Success to unregister team",
      {},
    )
  } catch (error) {
    return generateActionErrorResponse(
      "teams-registration-action:unregisterTeamAction",
      "Failed to unregister team",
      error,
    )
  }
}
