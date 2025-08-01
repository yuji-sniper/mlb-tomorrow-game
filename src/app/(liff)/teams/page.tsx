import { fetchTeams } from "@/features/teams/api/fetch-teams";
import { createLeaguesFromTeams } from "@/features/leagues/utils/league";
import Teams from "./_components/teams";

export default async function Page() {
  const teams = await fetchTeams();
  const leagues = createLeaguesFromTeams(teams);

  return (
    <Teams
      leagues={leagues}
    />
  );
}
