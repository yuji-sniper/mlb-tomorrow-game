import { Box, Typography } from "@mui/material";
import TeamCard from "./team-card";
import { League } from "@/shared/types/league";
import { Team } from "@/shared/types/team";
import React from "react";

type TeamsListProps = {
  leagues: League[];
  activeTeamIds?: Team['id'][];
  getTeamBadge: (teamId: Team["id"]) => React.ReactNode;
  onTeamClick: (teamId: Team["id"]) => void;
};

export default function TeamsList({
  leagues,
  activeTeamIds,
  getTeamBadge,
  onTeamClick,
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
                    badge={getTeamBadge(team.id)}
                    isActive={activeTeamIds?.includes(team.id)}
                    onClick={() => onTeamClick(team.id)}
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
