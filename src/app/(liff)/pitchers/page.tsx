import { fetchTeams } from "@/features/teams/api/fetch-teams";
import { createLeaguesFromTeams } from "@/utils/league";
import Pitchers from "./_components/pitchers";

export default async function Page() {
  const teams = await fetchTeams();
  const leagues = createLeaguesFromTeams(teams);

  return (
    <Pitchers
      leagues={leagues}
    />
  );
}
