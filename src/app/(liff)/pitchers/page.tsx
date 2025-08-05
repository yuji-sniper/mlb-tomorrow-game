import { fetchTeams } from "@/features/teams/api/fetch-teams";
import Pitchers from "./_components/pitchers";
import { createLeaguesFromTeams } from "@/features/leagues/utils/league";

export default async function Page() {
  const teams = await fetchTeams();
  const leagues = createLeaguesFromTeams(teams);

  return (
    <Pitchers
      leagues={leagues}
    />
  );
}
