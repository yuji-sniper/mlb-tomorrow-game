"use server";

import { Player } from "@/shared/types/player";
import { ActionResponse } from "@/shared/types/action";
import { CustomError } from "@/shared/errors/error";
import { ERROR_CODE } from "@/shared/constants/error";
import { generateActionErrorResponse, generateActionSuccessResponse } from "@/shared/utils/action";
import { z } from "zod";
import { fetchPlayersByIdsApi } from "@/shared/api/mlb-api";

type FetchPlayersByIdsActionRequest = {
  playerIds: Player['id'][];
}

type FetchPlayersByIdsActionResponse = {
  players: Player[];
}

export async function fetchPlayersByIdsAction(
  request: FetchPlayersByIdsActionRequest,
): Promise<ActionResponse<FetchPlayersByIdsActionResponse>> {
  try {
    // リクエストパラメータ取得
    const schema = z.object({
      playerIds: z.array(z.number()),
    });
    const parsedRequest = schema.safeParse(request);
    if (!parsedRequest.success) {
      throw new CustomError(
        ERROR_CODE.BAD_REQUEST,
        'Invalid request',
        z.treeifyError(parsedRequest.error),
      );
    }
    const { playerIds } = parsedRequest.data;

    // 選手の取得APIを呼び出し
    const players = await fetchPlayersByIdsApi(playerIds);

    return generateActionSuccessResponse({
      players,
    });
  } catch (error) {
    return generateActionErrorResponse(
      'pitchers-registration-form-action:fetchPlayersByIdsAction',
      'Failed to fetch players by ids',
      error,
    );
  }
}
