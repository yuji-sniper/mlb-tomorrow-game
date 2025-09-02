import { createLeaguesFromTeams } from "@/features/leagues/utils/league"
import { fetchTeamsApi } from "@/shared/api/mlb-api"
import TeamsRegistration from "./_components/teams-registration"

export default async function Page() {
  const teams = await fetchTeamsApi()
  const leagues = createLeaguesFromTeams(teams)

  return <TeamsRegistration leagues={leagues} />
}
