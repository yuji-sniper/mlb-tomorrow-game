import { Box, Typography } from "@mui/material";
import TeamCard from "./team-card";
import { League } from "@/shared/types/league";
import { Team } from "@/shared/types/team";

type TeamsListProps = {
  leagues: League[];
  selectedTeams: Team[];
  countByTeam?: Record<Team["id"], number>;
  onTeamCardClick: (team: Team) => void;
};

export default function TeamsList({
  leagues,
  selectedTeams,
  countByTeam,
  onTeamCardClick,
}: TeamsListProps) {
  return (
    <>
      {leagues.map((league) => (
        <Box
          mb={2}
          key={league.id}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
          >
            {league.name}
          </Typography>
          {league.divisions.map((division) => (
            <Box
              mb={1}
              key={division.id}
            >
              <Typography
                variant="subtitle2"
                fontSize="0.7rem"
                fontWeight="medium"
                mb={0.5}
                sx={{ pl: 0.5 }}
              >
                {division.name}
              </Typography>
              <Box display="flex" flexDirection="row" flexWrap="wrap" gap={0.5} justifyContent="center">
                {division.teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    isSelected={selectedTeams.some((t) => t.id === team.id)}
                    count={countByTeam?.[team.id] || 0}
                    onClick={() => onTeamCardClick(team)}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </>
  );
}
