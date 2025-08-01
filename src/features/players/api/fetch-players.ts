import { Player } from "@/shared/types/player";
import { PLAYER_STATUS } from "@/shared/constants/player-status";

type ApiPlayer = {
  person: {
    id: number;
    fullName: string;
  };
  position?: {
    code: string;
  };
  status: {
    code: string;
  };
  parentTeamId: number;
}

export async function fetchPlayersByTeamId(
  teamId: number,
  positionCodes: string[] = [],
  orderBy: 'status' = 'status',
): Promise<Player[]> {
  const res = await fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster/40Man`);
  if (!res.ok) throw new Error("Failed to fetch players");
  const data = await res.json();
  const roster: ApiPlayer[] = data.roster;

  // Player型に変換
  const players: Player[] = roster.map((player) => {
    const id = player.person.id;
    const statusCode = PLAYER_STATUS[player.status.code as keyof typeof PLAYER_STATUS]
      ? player.status.code as keyof typeof PLAYER_STATUS
      : '';
    return {
      id,
      teamId: player.parentTeamId,
      name: player.person.fullName,
      positionCode: player.position?.code || '',
      statusCode,
    };
  });

  // 重複がある場合、優先度の高いステータスの方を採用する
  const playerMap = new Map<number, Player>();

  for (const player of players) {
    const existingPlayer = playerMap.get(player.id);
    if (!existingPlayer ||
        PLAYER_STATUS[player.statusCode].priority > PLAYER_STATUS[existingPlayer.statusCode].priority
    ) {
      playerMap.set(player.id, player);
    }
  }

  // ポジションで絞り込み
  const filteredPlayers = (positionCodes.length > 0)
    ? Array.from(playerMap.values()).filter(player =>
        positionCodes.includes(player.positionCode)
      )
    : Array.from(playerMap.values());

  // ソートして返却
  switch (orderBy) {
    case 'status':
      return filteredPlayers.sort((a, b) => {
        return PLAYER_STATUS[b.statusCode].priority - PLAYER_STATUS[a.statusCode].priority;
      });
    default:
      return filteredPlayers;
  }
}
