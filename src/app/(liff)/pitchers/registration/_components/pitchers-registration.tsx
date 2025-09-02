"use client"

import { Typography } from "@mui/material"
import PlayersRegisterDialog from "@/features/players/components/players-register-dialog"
import TeamsList from "@/features/teams/components/teams-list"
import { CountBadge } from "@/shared/components/ui/badge/count-badge/count-badge"
import ConfirmDialog from "@/shared/components/ui/dialog/confirm-dialog/confirm-dialog"
import Title from "@/shared/components/ui/title/title"
import { LoadingUntilInitialized } from "@/shared/contexts/initialization-context"
import type { League } from "@/shared/types/league"
import type { Team } from "@/shared/types/team"
import { usePitchersRegistration } from "../_hooks/use-pitchers-registration"

type PitchersRegistrationProps = {
  leagues: League[]
}

export default function PitchersRegistration({
  leagues,
}: PitchersRegistrationProps) {
  const {
    // 状態
    selectedTeam,
    playersGroupedByTeamId,
    isPlayersRegisterDialogLoading,
    isSubmitting,
    isUnsavedDialogOpen,
    // メモ
    isSubmitDisabled,
    // 関数
    isTeamCardActive,
    isPlayerActive,
    getRegisteredCountOfTeam,
    handleTeamCardClick,
    handlePlayerClick,
    handlePlayersRegisterDialogClose,
    handlePlayersRegisterDialogSubmit,
    handleUnsavedDialogCancel,
    handleUnsavedDialogSubmit,
  } = usePitchersRegistration()

  /**
   * チームカードに表示するバッジを取得する
   */
  const getTeamBadge = (teamId: Team["id"]) => {
    const count = getRegisteredCountOfTeam(teamId)
    return count > 0 ? <CountBadge count={count} /> : undefined
  }

  return (
    <LoadingUntilInitialized>
      {/* [start]タイトル */}
      <Title>好きなピッチャーを登録</Title>
      {/* [end]タイトル */}

      {/* [start]チーム一覧 */}
      <TeamsList
        leagues={leagues}
        isTeamActive={isTeamCardActive}
        getTeamBadge={getTeamBadge}
        onTeamClick={handleTeamCardClick}
      />
      {/* [end]チーム一覧 */}

      {/* [start]ピッチャー登録ダイアログ */}
      {selectedTeam && (
        <PlayersRegisterDialog
          team={selectedTeam}
          players={playersGroupedByTeamId[selectedTeam.id] || []}
          isPlayerActive={isPlayerActive}
          isOpen={!!selectedTeam && !isUnsavedDialogOpen}
          isLoading={isPlayersRegisterDialogLoading}
          disabled={isSubmitting}
          submitDisabled={isSubmitDisabled}
          onPlayerClick={handlePlayerClick}
          onClose={handlePlayersRegisterDialogClose}
          onSubmit={handlePlayersRegisterDialogSubmit}
        />
      )}
      {/* [end]ピッチャー登録ダイアログ */}

      {/* [start]未保存アラートダイアログ */}
      <ConfirmDialog
        title="保存していません！"
        submitLabel="はい"
        cancelLabel="いいえ"
        isOpen={isUnsavedDialogOpen}
        onCancel={handleUnsavedDialogCancel}
        onSubmit={handleUnsavedDialogSubmit}
      >
        <Typography align="center" color="text.secondary">
          キャンセルしてもよろしいですか？
        </Typography>
      </ConfirmDialog>
    </LoadingUntilInitialized>
  )
}
