import { Leagues } from "@/types/league";
import { LEAGUE } from "@/constants/league";
import { Team } from "@/features/teams/types/team";

const initialLeagues: Leagues = {
  [LEAGUE.american.id.toString()]: {
    name: LEAGUE.american.name,
    divisions: {
      [LEAGUE.american.divisions.east.id.toString()]: {
        name: LEAGUE.american.divisions.east.name,
        teams: [],
      },
      [LEAGUE.american.divisions.central.id.toString()]: {
        name: LEAGUE.american.divisions.central.name,
        teams: [],
      },
      [LEAGUE.american.divisions.west.id.toString()]: {
        name: LEAGUE.american.divisions.west.name,
        teams: [],
      },
    },
  },
  [LEAGUE.national.id.toString()]: {
    name: LEAGUE.national.name,
    divisions: {
      [LEAGUE.national.divisions.east.id.toString()]: {
        name: LEAGUE.national.divisions.east.name,
        teams: [],
      },
      [LEAGUE.national.divisions.central.id.toString()]: {
        name: LEAGUE.national.divisions.central.name,
        teams: [],
      },
      [LEAGUE.national.divisions.west.id.toString()]: {
        name: LEAGUE.national.divisions.west.name,
        teams: [],
      },
    },
  },
};

export const createLeaguesFromTeams = (teams: Team[]): Leagues => {
  return teams.reduce((acc: Leagues, team: Team) => {
    acc[team.leagueId].divisions[team.divisionId].teams.push(team);
    return acc;
  }, initialLeagues);
}
