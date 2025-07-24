import { Box, Typography } from "@mui/material";
import { DivisionTeamsList } from "./division-teams-list";
import { League } from "@/types/league";
import { Team } from "@/features/teams/types/team";

type LeagueDivisionsListProps = {
  league: League;
  divisionOrder: string[];
  selectedTeamIds: number[];
  handleTeamCardClick: (team: Team) => void;
}

export default function LeagueDivisionsList({
  league,
  divisionOrder,
  selectedTeamIds,
  handleTeamCardClick,
}: LeagueDivisionsListProps) {
  return (
    <Box mb={2}>
      <Typography variant="h6" fontWeight="bold">
        {league.name}
      </Typography>
      {divisionOrder.map((divisionId) => {
        const division = league.divisions[divisionId];
        return (
          <DivisionTeamsList
            key={divisionId}
            division={division}
            selectedTeamIds={selectedTeamIds}
            handleTeamCardClick={handleTeamCardClick}
          />
        );
      })}
    </Box>
  );
}
