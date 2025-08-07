"use client";

import { League } from "@/shared/types/league";
import PlayersSelectionDialog from "@/features/players/components/players-selection-dialog";
import TeamsList from "@/features/teams/components/teams-list";
import RegisterPlayersDialog from "@/features/players/components/register-players-dialog";
import { Box } from "@mui/material";
import { LoadingUntilInitialized } from "@/shared/contexts/initialization-context";
import Title from "@/shared/components/ui/title/title";
import { Button } from "@/shared/components/ui/button/button";
import { CountBadge } from "@/shared/components/ui/badge/count-badge/count-badge";
import { Team } from "@/shared/types/team";
import { usePitchersRegistration } from "../_hooks/use-pitchers-registration";

type PitchersRegistrationProps = {
  leagues: League[];
};

export default function PitchersRegistration({
  leagues,
}: PitchersRegistrationProps) {
  const {
    // 状態
    selectedTeam,
    playersGroupByTeamId,
    isPlayersSelectionDialogLoading,
    isSavePlayersDialogOpen,
    isSubmitting,
    // メモ化
    selectedPlayers,
    selectedPlayerIds,
    isSaveButtonDisabled,
    // 関数
    handleTeamCardClick,
    handlePlayersSelectionDialogClose,
    handlePlayerClick,
    handleSaveButtonClick,
    handleRegisterPlayersDialogCancel,
    isTeamCardActive,
    getSelectedCountOfTeam,
    submit,
  } = usePitchersRegistration();

  /**
   * チームカードに表示するバッジを取得する
   */
  const getTeamBadge = (teamId: Team['id']) => {
    const count = getSelectedCountOfTeam(teamId);
    return count > 0
      ? <CountBadge count={count} />
      : undefined;
  }

  return (
    <LoadingUntilInitialized>
      {/* [start]タイトル */}
      <Title>
        好きなピッチャーを登録
      </Title>
      {/* [end]タイトル */}

      {/* [start]チーム一覧 */}
      <TeamsList
        leagues={leagues}
        isTeamActive={isTeamCardActive}
        getTeamBadge={getTeamBadge}
        onTeamClick={handleTeamCardClick}
      />
      {/* [end]チーム一覧 */}

      {/* [start]ピッチャー選択ダイアログ */}
      {selectedTeam && (
        <PlayersSelectionDialog
          isOpen={!!selectedTeam}
          onClose={handlePlayersSelectionDialogClose}
          isLoading={isPlayersSelectionDialogLoading}
          team={selectedTeam}
          players={playersGroupByTeamId[selectedTeam.id] || []}
          selectedPlayerIds={selectedPlayerIds}
          onPlayerClick={handlePlayerClick}
        />
      )}  
      {/* [end]ピッチャー選択ダイアログ */}

      {/* [start]選手登録ボタン・ダイアログ */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
        <Button
          text={`選択した${selectedPlayerIds.length}人を保存`}
          disabled={isSaveButtonDisabled}
          onClick={handleSaveButtonClick}
        />
      </Box>
      <RegisterPlayersDialog
        isOpen={isSavePlayersDialogOpen}
        onCancel={handleRegisterPlayersDialogCancel}
        title="選択したピッチャーを保存しますか？"
        players={selectedPlayers}
        onSubmit={submit}
        disabled={isSubmitting}
      />
      {/* [end]選手登録ボタン・ダイアログ */}
    </LoadingUntilInitialized>
  );
}
