import { Team } from '@/features/teams/types/team';
import { useState, useEffect } from 'react';

type UseTeams = {
  teams: Team[];
  isLoading: boolean;
  error: unknown;
}

export const useTeams = (): UseTeams => {
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>();
  const [error, setError] = useState<unknown>();

  const fetchTeams = async () => {
    try {
      const response = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1");
      const data = await response.json();
      const teams = data.teams.map((team: any) => ({
        id: team.id,
        name: team.teamName,
        fullName: team.name,
        image: `https://www.mlbstatic.com/team-logos/${team.id}.svg`,
        leagueId: team.league.id,
        divisionId: team.division.id,
      }));
      setTeams(teams);
    } catch (e) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    isLoading,
    error,
  };
}
