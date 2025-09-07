"use server"

import { z } from "zod"
import { createUserPlayers } from "@/features/user-players/repositories/create-user-players-repository"
import { deleteUserPlayersByUserIdAndPlayerIds } from "@/features/user-players/repositories/delete-user-players-repository"
import { createUser } from "@/features/users/repositories/create-user-repository"
import { findUser } from "@/features/users/repositories/find-user-repository"
import { verifyLineTokenApi } from "@/shared/api/line-api"
import { ERROR_CODE } from "@/shared/constants/error"
import prisma from "@/shared/lib/prisma/prisma"
import type { ActionResponse } from "@/shared/types/action"
import type { Player } from "@/shared/types/player"
import {
  generateActionErrorResponse,
  generateActionSuccessResponse,
} from "@/shared/utils/action"
import { CustomError } from "@/shared/utils/error"
import { logError, logInfo } from "@/shared/utils/log"

type RegisterPitchersActionRequest = {
  lineIdToken: string
  oldPlayerIds: Player["id"][]
  newPlayerIds: Player["id"][]
}

type RegisterPitchersActionResponse = {}

/**
 * ピッチャー登録アクション
 */
export async function registerPitchersAction(
  request: RegisterPitchersActionRequest,
): Promise<ActionResponse<RegisterPitchersActionResponse>> {
  const logPrefix = "pitchers-registration-action:registerPitchersAction"

  try {
    // リクエストボディ取得
    const schema = z.object({
      lineIdToken: z.string(),
      oldPlayerIds: z.array(z.number()),
      newPlayerIds: z.array(z.number()),
    })
    const parsedRequest = schema.safeParse(request)
    if (!parsedRequest.success) {
      throw new CustomError(
        ERROR_CODE.BAD_REQUEST,
        "Invalid request",
        z.treeifyError(parsedRequest.error),
      )
    }
    const { lineIdToken, oldPlayerIds, newPlayerIds } = parsedRequest.data

    // LINE ID取得
    const lineVerifyData = await verifyLineTokenApi(lineIdToken)
    const lineId = lineVerifyData.sub

    // ユーザー取得 or 作成
    const user = (await findUser(lineId)) ?? (await createUser(lineId))

    // 削除対象の選手IDと追加対象の選手IDを取得
    const deletePlayerIds = oldPlayerIds.filter(
      (id) => !newPlayerIds.includes(id),
    )
    const addPlayerIds = newPlayerIds.filter((id) => !oldPlayerIds.includes(id))

    // DBトランザクション
    await prisma.$transaction(async (tx) => {
      // ユーザーと選手の紐づけを更新
      if (deletePlayerIds.length > 0) {
        await deleteUserPlayersByUserIdAndPlayerIds(
          user.id,
          deletePlayerIds,
          tx,
        )
      }
      if (addPlayerIds.length > 0) {
        await createUserPlayers(user.id, addPlayerIds, tx)
      }
    })

    logInfo(logPrefix, "Success to register pitchers.")

    return generateActionSuccessResponse({})
  } catch (error) {
    logError(logPrefix, error)

    return generateActionErrorResponse("Failed to register pitchers.", error)
  }
}
