"use server";

import { verifyLineTokenAction } from "@/features/auth/actions/verify-line-token-action";
import { findOrCreateUserAction, findUserAction } from "@/features/users/actions/find-user-action";
import { createUserTeamsAction } from "@/features/user-teams/actions/create-user-teams-action";
import { deleteUserTeamsByUserIdAction } from "@/features/user-teams/actions/delete-user-teams-action";
import { fetchUserTeamsByUserIdAction } from "@/features/user-teams/actions/fetch-user-teams-action";
import { ERROR_CODE } from "@/shared/constants/error";
import prisma from "@/shared/lib/prisma/prisma";
import { ApiResponse } from "@/shared/types/api";
import { ServerError } from "@/shared/errors/error";
import { generateApiErrorResponse, generateApiSuccessResponse } from "@/shared/utils/api";
import { z } from "zod";

type GetTeamsRegistrationApiActionRequest = {
  lineIdToken: string;
}

type GetTeamsRegistrationApiActionResponse = {
  registeredTeamIds: number[];
}

type PostTeamsRegistrationApiActionRequest = {
  lineIdToken: string;
  selectedTeamIds: number[];
}

type PostTeamsRegistrationApiActionResponse = {
  registeredTeamIds: number[];
}

export async function getTeamsRegistrationApiAction(
  request: GetTeamsRegistrationApiActionRequest,
): Promise<ApiResponse<GetTeamsRegistrationApiActionResponse>> {
  try {
    // リクエストパラメータ取得
    const schema = z.object({
      lineIdToken: z.string(),
    });
    const parsedRequest = schema.safeParse(request);
    if (!parsedRequest.success) {
      throw new ServerError(
        ERROR_CODE.BAD_REQUEST,
        'Invalid request',
        z.treeifyError(parsedRequest.error),
      );
    }
    const { lineIdToken } = parsedRequest.data;

    // LINE IDトークンの検証
    const lineVerifyData = await verifyLineTokenAction(lineIdToken);
    const lineId = lineVerifyData.sub;
    
    // ユーザー取得
    const user = await findUserAction(lineId);
    
    // ユーザーとチームの紐づけを取得
    const userTeams = (!user)
      ? []
      : await fetchUserTeamsByUserIdAction(user.id);
    const registeredTeamIds = userTeams.map((userTeam) => userTeam.teamId);

    return generateApiSuccessResponse({
      registeredTeamIds,
    });
  } catch (error) {
    return generateApiErrorResponse(
      'getTeamsRegistrationAction',
      'Failed to get teams registration',
      error,
    );
  }
}

export async function postTeamsRegistrationApiAction(
  request: PostTeamsRegistrationApiActionRequest,
): Promise<ApiResponse<PostTeamsRegistrationApiActionResponse>> {
  try {
    // リクエストボディ取得
    const schema = z.object({
      lineIdToken: z.string(),
      selectedTeamIds: z.array(z.number()),
    });
    const parsedRequest = schema.safeParse(request);
    if (!parsedRequest.success) {
      throw new ServerError(
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
    const lineVerifyData = await verifyLineTokenAction(lineIdToken);
    const lineId = lineVerifyData.sub;

    // DBトランザクション
    const registeredTeamIds = await prisma.$transaction(async (tx) => {
      // ユーザー取得 or 作成
      const user = await findOrCreateUserAction(lineId);
      if (!user) {
        throw new Error('Failed to find or create user');
      }

      // ユーザーとチームの紐づけを更新
      await deleteUserTeamsByUserIdAction(user.id, tx);
      if (selectedTeamIds.length > 0) {
        await createUserTeamsAction(user.id, selectedTeamIds, tx);
      }

      // ユーザーとチームの紐づけを取得
      const userTeams = await fetchUserTeamsByUserIdAction(user.id, tx);

      // ユーザーとチームの紐づけのチームIDを取得
      return userTeams.map((userTeam) => userTeam.teamId);
    });

    return generateApiSuccessResponse({
      registeredTeamIds,
    });
  } catch (error) {
    return generateApiErrorResponse(
      'postTeamsRegistrationAction',
      'Failed to post teams registration',
      error,
    );
  }
}
