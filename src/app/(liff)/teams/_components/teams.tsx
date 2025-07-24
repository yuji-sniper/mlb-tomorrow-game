import { useLiffContext } from "@/hooks/useLiffContext";
import { 
  CircularProgress,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Leagues } from "@/types/league";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { createLeaguesFromTeams } from "@/utils/league";
import LeagueDivisionsList from "@/features/teams/components/league-divisions-list";
import SaveTeamsDialog from "@/features/teams/components/save-teams-dialog";
import { Team } from "@/features/teams/types/team";
import { Button } from "@/components/ui/button/button";
import { LEAGUE_DISPLAY_ORDER } from "@/constants/league";

export default function Teams() {
  const { liff, liffError } = useLiffContext();
  const [leagues, setLeagues] = useState<Leagues>();
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { teams, isLoading, error } = useTeams();

  const getLeagues = () => {
    if (!teams) { return; }
    const newLeagues = createLeaguesFromTeams(teams);
    setLeagues(newLeagues);
  }

  const handleTeamCardClick = (team: Team) => {
    setSelectedTeamIds((prev) =>
      prev.includes(team.id)
        ? prev.filter((id) => id !== team.id)
        : [...prev, team.id]
    );
  };

  const handleConfirmClick = () => {
    setSelectedTeams(teams?.filter((team) => selectedTeamIds.includes(team.id)) || []);
    setConfirmOpen(true);
  }

  useEffect(() => {
    getLeagues();
  }, [teams]);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2} maxWidth={320} mx="auto">
      {/* [start]チーム選択 */}
      {leagues && Object.entries(LEAGUE_DISPLAY_ORDER).map(([leagueId, divisionOrder]) => {
        const league = leagues[leagueId];
        return (
          <LeagueDivisionsList
            key={leagueId}
            league={league}
            divisionOrder={divisionOrder}
            selectedTeamIds={selectedTeamIds}
            handleTeamCardClick={handleTeamCardClick}
          />
        );
      })}
      {/* [end]チーム選択 */}

      {/* [start]保存ボタン */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
          mb: 2,
        }}
      >
        <Button
          disabled={confirmOpen}
          onClick={handleConfirmClick}
        >
          選択した{selectedTeamIds.length}チームを保存
        </Button>
      </Box>
      {/* [end]保存ボタン */}

      {/* [start]確認ダイアログ */}
      <SaveTeamsDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        selectedTeams={selectedTeams}
      />
      {/* [end]確認ダイアログ */}
    </Box>
  );
}
