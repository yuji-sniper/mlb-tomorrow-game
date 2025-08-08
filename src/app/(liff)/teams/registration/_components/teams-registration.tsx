"use client"

import { Box } from "@mui/material"
import SaveTeamsDialog from "@/features/teams/components/save-teams-dialog"
import TeamsList from "@/features/teams/components/teams-list"
import { Badge } from "@/shared/components/ui/badge/badge"
import { Button } from "@/shared/components/ui/button/button"
import Title from "@/shared/components/ui/title/title"
import { LoadingUntilInitialized } from "@/shared/contexts/initialization-context"
import type { League } from "@/shared/types/league"
import type { Team } from "@/shared/types/team"
import { useTeamsRegistration } from "../_hooks/use-teams-registration"

type TeamsRegistrationProps = {
  teams: Team[]
  leagues: League[]
}

export default function TeamsRegistration({
  teams,
  leagues,
}: TeamsRegistrationProps) {
  const {
    // 状態
    isOpenSaveTeamsDialog,
    isSubmitting,
    // メモ化
    selectedTeams,
    isSaveButtonDisabled,
    // 関数
    handleTeamCardClick,
    handleSaveButtonClick,
    handleSaveTeamsDialogCancel,
    isTeamCardActive,
    getTeamBadgeType,
    submit,
  } = useTeamsRegistration(teams)

  /**
   * チームカードに表示するバッジを取得する
   */
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

      {/* [start]チーム保存ボタン・ダイアログ */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
        <Button
          text="保存"
          disabled={isSaveButtonDisabled}
          onClick={handleSaveButtonClick}
        />
      </Box>
      <SaveTeamsDialog
        isOpen={isOpenSaveTeamsDialog}
        onCancel={handleSaveTeamsDialogCancel}
        title="選択したチームを保存しますか？"
        selectedTeams={selectedTeams}
        onSubmit={submit}
        disabled={isSubmitting}
      />
      {/* [end]チーム保存ボタン・ダイアログ */}
    </LoadingUntilInitialized>
  )
}
