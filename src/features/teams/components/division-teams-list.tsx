import { Box, Typography } from "@mui/material";
import TeamCard from "./team-card";
import { Division } from "@/types/division";
import { Team } from "@/features/teams/types/team";

type DivisionTeamsListProps = {
  division: Division;
  selectedTeamIds?: number[];
  selectedCountByTeam?: { [teamId: number]: number };
  handleTeamCardClick: (team: Team) => void;
}

export function DivisionTeamsList({
  division,
  selectedTeamIds,
  selectedCountByTeam,
  handleTeamCardClick,
}: DivisionTeamsListProps) {
  return (
    <Box mb={1}>
      <Typography variant="subtitle2" fontSize="0.7rem" fontWeight="medium" mb={0.5} sx={{ pl: 0.5 }}>
        {division.name}
      </Typography>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={0.5} justifyContent="center">
        {division.teams.map((team) => {
          return (
            <TeamCard
              key={team.id}
              team={team}
              isSelected={selectedTeamIds?.includes(team.id) || false}
              count={selectedCountByTeam?.[team.id] || 0}
              onClick={() => handleTeamCardClick(team)}
            />
          );
        })}
      </Box>
    </Box>
  );
}
