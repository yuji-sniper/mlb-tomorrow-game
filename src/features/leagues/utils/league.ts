import { LEAGUE_DIVISIONS } from "@/features/leagues/constants/league-divisions"
import { DIVISION_NAME_JP } from "@/shared/constants/division"
import { LEAGUE_ID, LEAGUE_NAME_JP } from "@/shared/constants/league"
import type { Division } from "@/shared/types/division"
import type { League } from "@/shared/types/league"
import type { Team } from "@/shared/types/team"

export const createLeaguesFromTeams = (allTeams: Team[]): League[] => {
  return Object.values(LEAGUE_ID).map((leagueId) => {
    const divisions: Division[] = LEAGUE_DIVISIONS[leagueId].map(
      (divisionId) => {
        const teams = allTeams.filter(
          (team) =>
            team.leagueId === leagueId && team.divisionId === divisionId,
        )
        return {
          id: divisionId,
          name: DIVISION_NAME_JP[divisionId],
          teams,
        }
      },
    )
    return {
      id: leagueId,
      name: LEAGUE_NAME_JP[leagueId],
      divisions,
    }
  })
}
