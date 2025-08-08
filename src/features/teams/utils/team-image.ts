import type { Team } from "@/shared/types/team"

export function generateTeamImageUrl(teamId: Team["id"]): string {
  return `https://www.mlbstatic.com/team-logos/${teamId}.svg`
}
