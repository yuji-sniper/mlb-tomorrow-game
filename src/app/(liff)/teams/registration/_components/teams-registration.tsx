"use client"

import TeamRegisterConfirmDialog from "@/features/teams/components/team-register-confirm-dialog"
import TeamUnregisterConfirmDialog from "@/features/teams/components/team-unregister-confirm-dialog"
import TeamsList from "@/features/teams/components/teams-list"
import { Badge } from "@/shared/components/ui/badge/badge"
import Title from "@/shared/components/ui/title/title"
import { LoadingUntilInitialized } from "@/shared/contexts/initialization-context"
import type { League } from "@/shared/types/league"
import type { Team } from "@/shared/types/team"
import { useTeamsRegistration } from "../_hooks/use-teams-registration"

type TeamsRegistrationProps = {
  leagues: League[]
}

export default function TeamsRegistration({ leagues }: TeamsRegistrationProps) {
  const {
    // 状態
    selectedTeam,
    isOpenRegisterConfirmDialog,
    isOpenUnregisterConfirmDialog,
    isSubmitting,
    // 関数
    isTeamCardActive,
    getTeamBadgeType,
    handleTeamCardClick,
    handleRegisterConfirmDialogCancel,
    handleRegisterConfirmDialogSubmit,
    handleUnregisterConfirmDialogCancel,
    handleUnregisterConfirmDialogSubmit,
  } = useTeamsRegistration()

  const getTeamBadge = (teamId: Team["id"]) => {
    const badgeType = getTeamBadgeType(teamId)
    return badgeType ? <Badge type={badgeType} /> : undefined
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
        isOpen={isOpenRegisterConfirmDialog}
        onCancel={handleRegisterConfirmDialogCancel}
        onSubmit={handleRegisterConfirmDialogSubmit}
        disabled={isSubmitting}
        selectedTeam={selectedTeam}
      />
      {/* [end]登録確認ダイアログ */}

      {/* [start]登録解除確認ダイアログ */}
      <TeamUnregisterConfirmDialog
        isOpen={isOpenUnregisterConfirmDialog}
        onCancel={handleUnregisterConfirmDialogCancel}
        onSubmit={handleUnregisterConfirmDialogSubmit}
        disabled={isSubmitting}
        selectedTeam={selectedTeam}
      />
      {/* [end]登録解除確認ダイアログ */}
    </LoadingUntilInitialized>
  )
}
