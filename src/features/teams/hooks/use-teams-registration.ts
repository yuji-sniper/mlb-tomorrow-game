import { useState } from "react";
import { Team } from "@/shared/types/team";

export const useTeamsRegistration = () => {
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  const toggleTeamSelection = (team: Team) => {
    setSelectedTeams((prev) =>
      prev.includes(team)
        ? prev.filter((t) => t.id !== team.id)
        : [...prev, team]
    );
  };

  const submit = () => {
    console.log("register teams");
  };

  return {
    selectedTeams,
    toggleTeamSelection,
    submit,
  };
}
