"use server";

import { Team } from "@/shared/types/team";
import { verifyLineTokenApi } from "@/shared/api/line-api";
import { ERROR_CODE } from "@/shared/constants/error";
import { ActionResponse } from "@/shared/types/action";
import { CustomError } from "@/shared/errors/error";
import { generateActionErrorResponse, generateActionSuccessResponse } from "@/shared/utils/action";
import { z } from "zod";
import prisma from "@/shared/lib/prisma/prisma";
import { findUser } from "@/features/users/repositories/find-user-repository";
import { createUser } from "@/features/users/repositories/create-user-repository";
import { deleteUserTeamsByUserId } from "@/features/user-teams/repositories/delete-user-teams-repository";
import { createUserTeams } from "@/features/user-teams/repositories/create-user-teams-repository";
import { fetchUserTeamsByUserId } from "@/features/user-teams/repositories/fetch-user-teams-repository";

type RegisterTeamsActionRequest = {
  lineIdToken: string;
  selectedTeamIds: Team['id'][];
}

type RegisterTeamsActionResponse = {
  registeredTeamIds: number[];
}

export async function registerTeamsAction(
  request: RegisterTeamsActionRequest,
): Promise<ActionResponse<RegisterTeamsActionResponse>> {
  try {
    // リクエストボディ取得
    const schema = z.object({
      lineIdToken: z.string(),
      selectedTeamIds: z.array(z.number()),
    });
    const parsedRequest = schema.safeParse(request);
    if (!parsedRequest.success) {
      throw new CustomError(
        ERROR_CODE.BAD_REQUEST,
        'Invalid request',
        z.treeifyError(parsedRequest.error),
      );
    }
    const {
      lineIdToken,
      selectedTeamIds,
    } = parsedRequest.data;

    // LINE ID取得
    const lineVerifyData = await verifyLineTokenApi(lineIdToken);
    const lineId = lineVerifyData.sub;

    // DBトランザクション
    const registeredTeamIds = await prisma.$transaction(async (tx) => {
      // ユーザー取得 or 作成
      const user =
        await findUser(lineId, tx) ??
        await createUser(lineId, tx);

      // ユーザーとチームの紐づけを更新
      await deleteUserTeamsByUserId(user.id, tx);
      if (selectedTeamIds.length > 0) {
        await createUserTeams(user.id, selectedTeamIds, tx);
      }

      // ユーザーとチームの紐づけを取得
      const userTeams = await fetchUserTeamsByUserId(user.id, tx);

      // ユーザーとチームの紐づけのチームIDを取得
      return userTeams.map((userTeam) => userTeam.teamId);
    });

    return generateActionSuccessResponse({
      registeredTeamIds,
    });
  } catch (error) {
    return generateActionErrorResponse(
      'teams-registration-action:saveUserTeamsAction',
      'Failed to save user teams',
      error,
    );
  }
}
