"use client"

import { Typography } from "@mui/material"
import { useCallback } from "react"
import PlayersRegisterDialog from "@/features/players/components/players-register-dialog"
import TeamsList from "@/features/teams/components/teams-list"
import { CountBadge } from "@/shared/components/ui/badge/count-badge/count-badge"
import ConfirmDialog from "@/shared/components/ui/dialog/confirm-dialog/confirm-dialog"
import Title from "@/shared/components/ui/title/title"
import { LoadingUntilInitialized } from "@/shared/contexts/initialization-context"
import { useSnackbarContext } from "@/shared/contexts/snackbar-context"
import type { League } from "@/shared/types/league"
import type { Team } from "@/shared/types/team"
import { usePitchersRegistration } from "../_hooks/use-pitchers-registration"

type PitchersRegistrationProps = {
  leagues: League[]
}

export default function PitchersRegistration({
  leagues,
}: PitchersRegistrationProps) {
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbarContext()

  const {
    // 状態
    selectedTeam,
    currentTeamPlayers,
    isPlayersRegisterDialogOpen,
    isPlayersRegisterDialogLoading,
    isPlayersRegisterDialogCloseDisabled,
    isPlayersRegisterDialogSubmitDisabled,
    isUnsavedDialogOpen,
    // メモ
    isPlayersModified,
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
  const getTeamBadge = useCallback(
    (teamId: Team["id"]) => {
      const count = getRegisteredCountOfTeam(teamId)
      return count > 0 ? <CountBadge count={count} /> : undefined
    },
    [getRegisteredCountOfTeam],
  )

  /**
   * チームカードクリック
   */
  const onTeamCardClick = async (team: Team) => {
    const result = await handleTeamCardClick(team)

    if (!result.ok) {
      showErrorSnackbar("ピッチャーの取得に失敗しました")
    }
  }

  /**
   * ピッチャー登録ダイアログ送信
   */
  const onPlayersRegisterDialogSubmit = async () => {
    const result = await handlePlayersRegisterDialogSubmit()

    result.ok
      ? showSuccessSnackbar("ピッチャー登録を保存しました")
      : showErrorSnackbar("ピッチャー登録の保存に失敗しました")
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
        onTeamClick={onTeamCardClick}
      />
      {/* [end]チーム一覧 */}

      {/* [start]ピッチャー登録ダイアログ */}
      {selectedTeam && (
        <PlayersRegisterDialog
          team={selectedTeam}
          players={currentTeamPlayers}
          isPlayerActive={isPlayerActive}
          isOpen={isPlayersRegisterDialogOpen}
          isLoading={isPlayersRegisterDialogLoading}
          closeDisabled={isPlayersRegisterDialogCloseDisabled}
          submitDisabled={
            isPlayersRegisterDialogSubmitDisabled || !isPlayersModified
          }
          onPlayerClick={handlePlayerClick}
          onClose={handlePlayersRegisterDialogClose}
          onSubmit={onPlayersRegisterDialogSubmit}
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
        <Typography color="text.secondary">キャンセルしますか？</Typography>
      </ConfirmDialog>
      {/* [end]未保存アラートダイアログ */}
    </LoadingUntilInitialized>
  )
}
