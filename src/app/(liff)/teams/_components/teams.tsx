"use client";

import { useLiffContext } from "@/contexts/liff-context";
import { useEffect, useState } from "react";
import { Leagues } from "@/types/league";
import LeagueDivisionsList from "@/features/teams/components/league-divisions-list";
import SaveTeamsDialog from "@/features/teams/components/save-teams-dialog";
import { Team } from "@/features/teams/types/team";
import { Button } from "@/components/ui/button/button";
import { LEAGUE_DISPLAY_ORDER } from "@/constants/league";
import CenterButtonBox from "@/components/ui/button-box/center-button-box/center-button-box";
import LiffLayout from "@/components/layouts/liff-layout";

type TeamsProps = {
  leagues: Leagues;
};

export default function Teams({ leagues }: TeamsProps) {
  const { liff, liffError } = useLiffContext();
  const [mounted, setMounted] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleTeamCardClick = (team: Team) => {
    setSelectedTeams((prev) =>
      prev.includes(team)
        ? prev.filter((t) => t.id !== team.id)
        : [...prev, team]
    );
  };

  const handleConfirmClick = () => {
    setConfirmOpen(true);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <LiffLayout>
      {/* [start]チーム選択 */}
      {leagues && Object.entries(LEAGUE_DISPLAY_ORDER).map(([leagueId, divisionOrder]) => {
        return (
          <LeagueDivisionsList
            key={leagueId}
            league={leagues[leagueId]}
            divisionOrder={divisionOrder}
            selectedTeamIds={selectedTeams.map((team) => team.id)}
            handleTeamCardClick={handleTeamCardClick}
          />
        );
      })}
      {/* [end]チーム選択 */}

      {/* [start]保存ボタン */}
      <CenterButtonBox>
        <Button
          disabled={confirmOpen}
          onClick={handleConfirmClick}
        >
          選択した{selectedTeams.length}チームを保存
        </Button>
      </CenterButtonBox>
      {/* [end]保存ボタン */}

      {/* [start]確認ダイアログ */}
      <SaveTeamsDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        selectedTeams={selectedTeams}
      />
      {/* [end]確認ダイアログ */}
    </LiffLayout>
  );
}
