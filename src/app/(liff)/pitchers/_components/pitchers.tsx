"use client";

import { useLiffContext } from "@/shared/contexts/liff-context";
import { League } from "@/shared/types/league";
import PlayersSelectionDialog from "@/features/players/components/players-selection-dialog";
import LiffLayout from "@/shared/components/layouts/liff-layout";
import TeamsList from "@/features/teams/components/teams-list";
import RegisterPlayersDialog from "@/features/players/components/register-players-dialog";
import { usePitchersRegistration } from "@/features/players/hooks/use-pitchers-registration";
import { Box } from "@mui/material";

type PitchersProps = {
  leagues: League[];
};

export default function Pitchers({ leagues }: PitchersProps) {
  const { liff, liffError } = useLiffContext();

  const {
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
  } = usePitchersRegistration();

  return (
    <LiffLayout>
      {/* [start]チーム一覧 */}
      <TeamsList
        leagues={leagues}
        selectedTeams={selectedTeam ? [selectedTeam] : []}
        countByTeam={selectedPlayersCountByTeam}
        onTeamCardClick={handleTeamSelect}
      />
      {/* [end]チーム一覧 */}

      {/* [start]ピッチャー選択ダイアログ */}
      {selectedTeam && (
        <PlayersSelectionDialog
          isOpen={playersSelectionDialogOpen}
          onClose={handlePlayersSelectionDialogClose}
          team={selectedTeam}
          isPlayersLoading={isPlayersLoading}
          players={players}
          selectedPlayers={selectedPlayers}
          handlePlayerSelectionToggle={handlePlayerSelectionToggle}
        />
      )}
      {/* [end]ピッチャー選択ダイアログ */}

      {/* [start]選手登録ボタン・ダイアログ */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
        <RegisterPlayersDialog
          title="選択したピッチャーを保存しますか？"
          buttonLabel={`選択した${selectedPlayers.length}人を保存`}
          players={selectedPlayers}
          onSubmit={handleRegisterPlayers}
        />
      </Box>
      {/* [end]選手登録ボタン・ダイアログ */}
    </LiffLayout>
  );
}
