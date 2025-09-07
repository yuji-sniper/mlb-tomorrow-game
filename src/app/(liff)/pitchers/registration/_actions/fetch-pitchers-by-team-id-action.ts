"use server"

import { z } from "zod"
import { PITCHER_POSITIONS } from "@/features/players/constants/position"
import {
  filterPlayersByPosition,
  removeDuplicatePlayers,
  sortPlayersByStatusPriority,
} from "@/features/players/utils/players"
import { fetchTeamRoster40ManApi } from "@/shared/api/mlb-api"
import { ERROR_CODE } from "@/shared/constants/error"
import type { ActionResponse } from "@/shared/types/action"
import type { Player } from "@/shared/types/player"
import type { Team } from "@/shared/types/team"
import {
  generateActionErrorResponse,
  generateActionSuccessResponse,
} from "@/shared/utils/action"
import { CustomError } from "@/shared/utils/error"

type FetchPitchersByTeamIdActionRequest = {
  teamId: Team["id"]
}

type FetchPitchersByTeamIdActionResponse = {
  players: Player[]
}

/**
 * チームのピッチャー一覧取得アクション
 */
export async function fetchPitchersByTeamIdAction(
  request: FetchPitchersByTeamIdActionRequest,
): Promise<ActionResponse<FetchPitchersByTeamIdActionResponse>> {
  try {
    // リクエストパラメータ取得
    const schema = z.object({
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
    const { teamId } = parsedRequest.data

    // チームのピッチャー一覧取得
    const players = await fetchTeamRoster40ManApi(teamId)
    const pitchers = filterPlayersByPosition(players, PITCHER_POSITIONS)
    const uniquePitchers = removeDuplicatePlayers(pitchers)
    const sortedPitchers = sortPlayersByStatusPriority(uniquePitchers)

    return generateActionSuccessResponse(
      "pitchers-registration-form-action:fetchPitchersByTeamIdAction",
      "Success to fetch pitchers by team id",
      {
        players: sortedPitchers,
      },
    )
  } catch (error) {
    return generateActionErrorResponse(
      "pitchers-registration-form-action:fetchPitchersByTeamIdAction",
      "Failed to fetch pitchers by team id",
      error,
    )
  }
}
