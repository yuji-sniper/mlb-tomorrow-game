import { LEAGUE_ID } from "@/shared/constants/league";
import { LEAGUE_NAME_JP } from "@/shared/constants/league";
import { LEAGUE_DIVISIONS } from "@/features/leagues/constants/league-divisions";
import { Division } from "@/shared/types/division";
import { League } from "@/shared/types/league";
import { Team } from "@/shared/types/team";
import { DIVISION_NAME_JP } from "@/shared/constants/division";

export const createLeaguesFromTeams = (allTeams: Team[]): League[] => {
  return Object.values(LEAGUE_ID).map((leagueId) => {
    const divisions: Division[] = LEAGUE_DIVISIONS[leagueId].map((divisionId) => {
      const teams = allTeams.filter((team) => (
        team.leagueId === leagueId &&
        team.divisionId === divisionId
      ));
      return {
        id: divisionId,
        name: DIVISION_NAME_JP[divisionId],
        teams,
      };
    });
    return {
      id: leagueId,
      name: LEAGUE_NAME_JP[leagueId],
      divisions,
    };
  });
}
