"use client";

import { Team } from "@/shared/types/team";
import { League } from "@/shared/types/league";
import SaveTeamsDialog from "@/features/teams/components/save-teams-dialog";
import TeamsList from "@/features/teams/components/teams-list";
import { Box, Typography } from "@mui/material";
import { useTeamsRegistration } from "../_hooks/use-teams-registration";
import { Button } from "@/shared/components/ui/button/button";
import { AddBadge } from "@/shared/components/ui/badge/add-badge/add-badge";
import { RemoveBadge } from "@/shared/components/ui/badge/remove-badge/remove-badge";
import { CheckBadge } from "@/shared/components/ui/badge/check-badge/check-badge";
import { InitializationGuard } from "@/shared/contexts/initialization-context";

type TeamsRegistrationProps = {
  teams: Team[];
  leagues: League[];
};

export default function TeamsRegistration({
  teams,
  leagues,
}: TeamsRegistrationProps) {
  const {
    selectedTeams,
    newSelectedTeamIds,
    isSaveButtonDisabled,
    isSubmitting,
    isOpenSaveTeamsDialog,
    toggleTeamIdSelection,
    getTeamBadgeType,
    setIsOpenSaveTeamsDialog,
    submit,
  } = useTeamsRegistration(teams);

  /**
   * チームカードに表示するバッジを取得する
   */
  const getTeamBadge = (teamId: Team["id"]) => {
    const badgeType = getTeamBadgeType(teamId);
    switch (badgeType) {
      case 'add':
        return <AddBadge />;
      case 'remove':
        return <RemoveBadge />;
      case 'check':
        return <CheckBadge />;
      default:
        return null;
    }
  };
  return (
    <InitializationGuard>
      {/* [start]タイトル */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          チーム登録
        </Typography>
      </Box>
      {/* [end]タイトル */}

      {/* [start]チーム選択 */}
      <TeamsList
        leagues={leagues}
        activeTeamIds={newSelectedTeamIds}
        getTeamBadge={getTeamBadge}
        onTeamClick={toggleTeamIdSelection}
      />
      {/* [end]チーム選択 */}

      {/* [start]チーム保存ボタン・ダイアログ */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
        <Button
          disabled={isSaveButtonDisabled}
          onClick={() => setIsOpenSaveTeamsDialog(true)}
        >
          保存
        </Button>
        <SaveTeamsDialog
          isOpen={isOpenSaveTeamsDialog}
          onCancel={() => setIsOpenSaveTeamsDialog(false)}
          title="選択したチームを保存しますか？"
          selectedTeams={selectedTeams}
          onSubmit={submit}
          disabled={isSubmitting}
        />
      </Box>
      {/* [end]チーム保存ボタン・ダイアログ */}
    </InitializationGuard>
  );
}
