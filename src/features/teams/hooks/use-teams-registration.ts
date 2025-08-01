import { useState } from "react";
import { Team } from "@/shared/types/team";

export const useTeamsRegistration = () => {
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  const handleTeamSelectionToggle = (team: Team) => {
    setSelectedTeams((prev) =>
      prev.includes(team)
        ? prev.filter((t) => t.id !== team.id)
        : [...prev, team]
    );
  };

  const handleRegisterTeams = () => {
    console.log("register teams");
  };

  return {
    selectedTeams,
    handleTeamSelectionToggle,
    handleRegisterTeams,
  };
}
