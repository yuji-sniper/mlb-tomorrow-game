import { Box, Typography } from "@mui/material";
import { DivisionTeamsList } from "./division-teams-list";
import { League } from "@/types/league";
import { Team } from "@/features/teams/types/team";

type LeagueDivisionsListProps = {
  league: League;
  selectedTeamIds: number[];
  handleTeamCardClick: (team: Team) => void;
}

export function LeagueDivisionsList({ league, selectedTeamIds, handleTeamCardClick }: LeagueDivisionsListProps) {
  return (
    <Box mb={2}>
      <Typography variant="h6" fontWeight="bold">
        {league.name}
      </Typography>
      {Object.entries(league.divisions).map(([divisionId, division]) => {
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
