import { fetchTeams } from "@/features/teams/api/fetch-teams";
import { createLeaguesFromTeams } from "@/features/leagues/utils/league";
import TeamsRegistration from "./_components/teams-registration";

export default async function Page() {
  const teams = await fetchTeams();
  const leagues = createLeaguesFromTeams(teams);

  return (
    <TeamsRegistration
      teams={teams}
      leagues={leagues}
    />
  );
}
