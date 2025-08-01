"use server";

import { fetchPlayersByTeamId } from "../api/fetch-players";
import { Team } from "@/shared/types/team";

export async function fetchPlayersByTeamIdAction(
  team: Team,
  positionCodes: string[] = [],
  orderBy: 'status' = 'status',
) {
  try {
    const players = await fetchPlayersByTeamId(team.id, positionCodes, orderBy);
    return players.map(player => ({ ...player, team }));
  } catch (error) {
    console.error("Failed to fetch players:", error);
    throw new Error("選手の取得に失敗しました");
  }
}
