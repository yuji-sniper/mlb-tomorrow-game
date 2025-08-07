"use server";

import { Team } from "@/shared/types/team";
import { Player } from "@/shared/types/player";
import { ActionResponse } from "@/shared/types/action";
import { CustomError } from "@/shared/errors/error";
import { ERROR_CODE } from "@/shared/constants/error";
import { generateActionErrorResponse, generateActionSuccessResponse } from "@/shared/utils/action";
import { z } from "zod";
import { fetchTeamRoster40ManApi } from "@/shared/api/mlb-api";
import { filterPlayersByPosition, removeDuplicatePlayers, sortPlayersByStatusPriority } from "@/features/players/utils/players";
import { PITCHER_POSITIONS } from "@/features/players/constants/position";

type FetchPitchersByTeamIdActionRequest = {
  teamId: Team['id'];
}

type FetchPitchersByTeamIdActionResponse = {
  players: Player[];
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
    });
    const parsedRequest = schema.safeParse(request);
    if (!parsedRequest.success) {
      throw new CustomError(
        ERROR_CODE.BAD_REQUEST,
        'Invalid request',
        z.treeifyError(parsedRequest.error),
      );
    }
    const { teamId } = parsedRequest.data;

    // チームのピッチャー一覧取得
    const players = await fetchTeamRoster40ManApi(teamId);
    const pitchers = filterPlayersByPosition(players, PITCHER_POSITIONS);
    const uniquePitchers = removeDuplicatePlayers(pitchers);
    const sortedPitchers = sortPlayersByStatusPriority(uniquePitchers);

    return generateActionSuccessResponse({
      players: sortedPitchers,
    });
  } catch (error) {
    return generateActionErrorResponse(
      'pitchers-registration-form-action:fetchPitchersByTeamIdAction',
      'Failed to fetch pitchers by team id',
      error,
    );
  }
}
