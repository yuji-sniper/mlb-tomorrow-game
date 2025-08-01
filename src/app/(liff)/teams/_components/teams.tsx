"use client";

import { useLiffContext } from "@/shared/contexts/liff-context";
import { League } from "@/shared/types/league";
import SaveTeamsDialog from "@/features/teams/components/save-teams-dialog";
import LiffLayout from "@/shared/components/layouts/liff-layout";
import TeamsList from "@/features/teams/components/teams-list";
import { Box } from "@mui/material";
import { useTeamsRegistration } from "@/features/teams/hooks/use-teams-registration";

type TeamsProps = {
  leagues: League[];
};

export default function Teams({ leagues }: TeamsProps) {
  const { liff, liffError } = useLiffContext();

  const {
    selectedTeams,
    toggleTeamSelection,
    submit,
  } = useTeamsRegistration();

  return (
    <LiffLayout>
      {/* [start]チーム選択 */}
      <TeamsList
        leagues={leagues}
        selectedTeams={selectedTeams}
        onTeamClick={toggleTeamSelection}
      />
      {/* [end]チーム選択 */}

      {/* [start]チーム保存ボタン・ダイアログ */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
        <SaveTeamsDialog
          title="選択したチームを保存しますか？"
          buttonLabel={`選択した${selectedTeams.length}チームを保存`}
          selectedTeams={selectedTeams}
          onSubmit={submit}
        />
      </Box>
      {/* [end]チーム保存ボタン・ダイアログ */}
    </LiffLayout>
  );
}
