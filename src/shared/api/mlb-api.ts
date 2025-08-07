import { Player, PlayerStatusCode } from "@/shared/types/player";
import { PLAYER_STATUS } from "@/shared/constants/player-status";
import { Team } from "@/shared/types/team";

/**
 * チーム一覧を取得する
 */
export async function fetchTeamsApi(): Promise<Team[]> {
  const res = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1");
  if (!res.ok) {
    throw new Error("Failed to fetch teams");
  }

  const data = await res.json();

  return data.teams.map((team: any) => ({
    id: team.id,
    name: team.name,
    teamName: team.teamName,
    leagueId: team.league.id,
    divisionId: team.division.id,
  }));
} 

/**
 * チームの40人枠ロースターを取得する
 */
export async function fetchTeamRoster40ManApi(
  teamId: number,
): Promise<Player[]> {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster/40Man`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch team roster");
  }

  const data = await res.json();

  const players: Player[] = data.roster.map((player: any) => {
    const id = player.person.id;
    const statusCode = PLAYER_STATUS[player.status.code as PlayerStatusCode]
      ? player.status.code as PlayerStatusCode
      : '';
    return {
      id,
      teamId: player.parentTeamId,
      name: player.person.fullName,
      positionCode: player.position?.code || '',
      statusCode,
    };
  });

  return players;
}

/**
 * 指定したID群の選手情報を取得する
 */
export async function fetchPlayersByIdsApi(
  personIds: number[],
): Promise<Player[]> {
  if (personIds.length === 0) {
    return [];
  }

  const params = new URLSearchParams();
  params.append('personIds', personIds.join(','));
  params.append('hydrate', 'currentTeam');

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people?${params.toString()}`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch people");
  }

  const data = await res.json();

  const players: Player[] = data.people.map((person: any) => ({
    id: person.id,
    teamId: person.currentTeam.id,
    name: person.fullName,
    positionCode: '',
    statusCode: '',
  }));

  return players;
}
