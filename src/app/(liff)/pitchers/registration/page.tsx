import { createLeaguesFromTeams } from "@/features/leagues/utils/league"
import { fetchTeamsApi } from "@/shared/api/mlb-api"
import PitchersRegistration from "./_components/pitchers-registration"

export default async function Page() {
  const teams = await fetchTeamsApi()
  const leagues = createLeaguesFromTeams(teams)

  return <PitchersRegistration leagues={leagues} />
}
