import { Box, Typography } from "@mui/material"
import type { League } from "@/shared/types/league"
import type { Team } from "@/shared/types/team"
import TeamCard from "./team-card"

type TeamsListProps = {
  leagues: League[]
  isTeamActive?: (teamId: Team["id"]) => boolean
  getTeamBadge?: (teamId: Team["id"]) => React.ReactNode
  onTeamClick: (team: Team) => void
}

export default function TeamsList({
  leagues,
  isTeamActive,
  getTeamBadge,
  onTeamClick,
}: TeamsListProps) {
  return (
    <>
      {leagues.map((league) => (
        <Box mb={3} key={league.id}>
          <Box display="flex" alignItems="center" mb={0.5}>
            <Box width="4px" height="1.25rem" bgcolor="grey.700" mr={0.5} />
            <Typography variant="h6" fontWeight="bold" fontSize="1rem">
              {league.name}
            </Typography>
          </Box>
          {league.divisions.map((division) => (
            <Box mb={1} key={division.id}>
              <Typography
                variant="subtitle2"
                fontSize="0.7rem"
                fontWeight="medium"
                mb={0.2}
              >
                {division.name}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 0.5,
                  justifyItems: "center",
                }}
              >
                {division.teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    badge={getTeamBadge?.(team.id)}
                    isActive={isTeamActive?.(team.id)}
                    onClick={() => onTeamClick(team)}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </>
  )
}
