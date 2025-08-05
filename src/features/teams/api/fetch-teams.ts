import { Team } from "@/shared/types/team";

export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1");
  if (!res.ok) {
    throw new Error("Failed to fetch teams");
  }

  const data = await res.json();

  return data.teams.map((team: any) => ({
    id: team.id,
    name: team.name,
    teamName: team.teamName,
    image: `https://www.mlbstatic.com/team-logos/${team.id}.svg`,
    leagueId: team.league.id,
    divisionId: team.division.id,
  }));
} 
