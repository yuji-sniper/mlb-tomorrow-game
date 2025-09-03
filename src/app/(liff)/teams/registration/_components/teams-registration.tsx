"use client"

import { useCallback } from "react"
import TeamRegisterConfirmDialog from "@/features/teams/components/team-register-confirm-dialog"
import TeamUnregisterConfirmDialog from "@/features/teams/components/team-unregister-confirm-dialog"
import TeamsList from "@/features/teams/components/teams-list"
import { Badge } from "@/shared/components/ui/badge/badge"
import Title from "@/shared/components/ui/title/title"
import { LoadingUntilInitialized } from "@/shared/contexts/initialization-context"
import { useSnackbarContext } from "@/shared/contexts/snackbar-context"
import type { League } from "@/shared/types/league"
import type { Team } from "@/shared/types/team"
import { useTeamsRegistration } from "../_hooks/use-teams-registration"

type TeamsRegistrationProps = {
  leagues: League[]
}

export default function TeamsRegistration({ leagues }: TeamsRegistrationProps) {
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbarContext()

  const {
    // 状態
    selectedTeam,
    isRegisterConfirmDialogOpen,
    isRegisterConfirmDialogCancelDisabled,
    isRegisterConfirmDialogSubmitDisabled,
    isUnregisterConfirmDialogOpen,
    isUnregisterConfirmDialogCancelDisabled,
    isUnregisterConfirmDialogSubmitDisabled,
    // 関数
    isTeamCardActive,
    getTeamBadgeType,
    handleTeamCardClick,
    handleRegisterConfirmDialogCancel,
    handleRegisterConfirmDialogSubmit,
    handleUnregisterConfirmDialogCancel,
    handleUnregisterConfirmDialogSubmit,
  } = useTeamsRegistration()

  /**
   * チームカードに表示するバッジを取得する
   */
  const getTeamBadge = useCallback(
    (teamId: Team["id"]) => {
      const badgeType = getTeamBadgeType(teamId)
      return badgeType ? <Badge type={badgeType} /> : undefined
    },
    [getTeamBadgeType],
  )

  /**
   * 登録確認ダイアログ送信
   */
  const onRegisterConfirmDialogSubmit = async () => {
    const result = await handleRegisterConfirmDialogSubmit()

    result.ok
      ? showSuccessSnackbar("チームを登録しました")
      : showErrorSnackbar("チーム登録に失敗しました")
  }

  /**
   * 登録解除確認ダイアログ送信
   */
  const onUnregisterConfirmDialogSubmit = async () => {
    const result = await handleUnregisterConfirmDialogSubmit()

    result.ok
      ? showSuccessSnackbar("チームを登録解除しました")
      : showErrorSnackbar("チーム登録解除に失敗しました")
  }

  return (
    <LoadingUntilInitialized>
      {/* [start]タイトル */}
      <Title>好きなチームを登録</Title>
      {/* [end]タイトル */}

      {/* [start]チーム選択 */}
      <TeamsList
        leagues={leagues}
        isTeamActive={isTeamCardActive}
        getTeamBadge={getTeamBadge}
        onTeamClick={handleTeamCardClick}
      />
      {/* [end]チーム選択 */}

      {/* [start]登録確認ダイアログ */}
      <TeamRegisterConfirmDialog
        isOpen={isRegisterConfirmDialogOpen}
        isCancelDisabled={isRegisterConfirmDialogCancelDisabled}
        isSubmitDisabled={isRegisterConfirmDialogSubmitDisabled}
        onCancel={handleRegisterConfirmDialogCancel}
        onSubmit={onRegisterConfirmDialogSubmit}
        selectedTeam={selectedTeam}
      />
      {/* [end]登録確認ダイアログ */}

      {/* [start]登録解除確認ダイアログ */}
      <TeamUnregisterConfirmDialog
        isOpen={isUnregisterConfirmDialogOpen}
        isCancelDisabled={isUnregisterConfirmDialogCancelDisabled}
        isSubmitDisabled={isUnregisterConfirmDialogSubmitDisabled}
        onCancel={handleUnregisterConfirmDialogCancel}
        onSubmit={onUnregisterConfirmDialogSubmit}
        selectedTeam={selectedTeam}
      />
      {/* [end]登録解除確認ダイアログ */}
    </LoadingUntilInitialized>
  )
}
