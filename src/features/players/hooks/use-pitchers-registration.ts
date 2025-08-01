import { useEffect, useMemo, useState } from "react";
import { Team } from "@/shared/types/team";
import { Player } from "@/shared/types/player";
import { fetchPlayersByTeamId } from "../api/fetch-players";
import { PITCHER_POSITIONS } from "../constants/position";

export const usePitchersRegistration = () => {
  const [selectedTeam, setSelectedTeam] = useState<Team>();
  const [playersSelectionDialogOpen, setPlayersSelectionDialogOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isPlayersLoading, setIsPlayersLoading] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  const selectedPlayersCountByTeam: Record<Team["id"], number> = useMemo(() => {
    return selectedPlayers.reduce((countByTeam, player) => {
      countByTeam[player.teamId] = (countByTeam[player.teamId] || 0) + 1;
      return countByTeam;
    }, {} as Record<Team["id"], number>);
  }, [selectedPlayers]);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!selectedTeam) {
        setPlayers([]);
        setIsPlayersLoading(false);
        return;
      }

      setIsPlayersLoading(true);
      const fetchedPlayers = await fetchPlayersByTeamId(selectedTeam.id, PITCHER_POSITIONS);
      setPlayers(fetchedPlayers.map(player => ({ ...player, team: selectedTeam })));
      setIsPlayersLoading(false);
    };

    fetchPlayers();
  }, [selectedTeam]);

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setPlayersSelectionDialogOpen(true);
  };

  const handlePlayersSelectionDialogClose = () => {
    setSelectedTeam(undefined);
    setPlayersSelectionDialogOpen(false);
  };

  const handlePlayerSelectionToggle = (player: Player) => {
    setSelectedPlayers((prev) => {
      const isSelected = prev.some((p) => p.id === player.id);
      return isSelected
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, player];
    });
  };

  const handleRegisterPlayers = () => {
    console.log("handleRegisterPlayers");
  };

  return {
    selectedTeam,
    playersSelectionDialogOpen,
    players,
    isPlayersLoading,
    selectedPlayers,
    selectedPlayersCountByTeam,
    handleTeamSelect,
    handlePlayersSelectionDialogClose,
    handlePlayerSelectionToggle,
    handleRegisterPlayers,
  };
}
