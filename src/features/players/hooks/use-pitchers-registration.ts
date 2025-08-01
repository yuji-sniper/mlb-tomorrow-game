import { useEffect, useMemo, useState } from "react";
import { Team } from "@/shared/types/team";
import { Player } from "@/shared/types/player";
import { PITCHER_POSITIONS } from "../constants/position";
import { fetchPlayersByTeamIdAction } from "../actions/fetch-players-action";

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
      try {
        const fetchedPlayers = await fetchPlayersByTeamIdAction(selectedTeam, PITCHER_POSITIONS);
        setPlayers(fetchedPlayers);
      } catch (error) {
        console.error("Failed to fetch players:", error);
        setPlayers([]);
      } finally {
        setIsPlayersLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedTeam]);

  const openPlayersSelectionDialog = (team: Team) => {
    setSelectedTeam(team);
    setPlayersSelectionDialogOpen(true);
  };

  const closePlayersSelectionDialog = () => {
    setSelectedTeam(undefined);
    setPlayersSelectionDialogOpen(false);
  };

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers((prev) => {
      const isSelected = prev.some((p) => p.id === player.id);
      return isSelected
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, player];
    });
  };

  const submit = () => {
    console.log("handleRegisterPlayers");
  };

  return {
    selectedTeam,
    playersSelectionDialogOpen,
    players,
    isPlayersLoading,
    selectedPlayers,
    selectedPlayersCountByTeam,
    openPlayersSelectionDialog,
    closePlayersSelectionDialog,
    togglePlayerSelection,
    submit,
  };
}
