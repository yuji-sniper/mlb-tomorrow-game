import { useEffect, useState } from "react";
import { useLiffContext } from "@/hooks/useLiffContext";
import { LEAGUE_DISPLAY_ORDER } from "@/constants/league";
import { Box, CircularProgress } from "@mui/material";
import { POSITION } from "@/constants/position";
import { PLAYER_STATUS } from "@/constants/playerStatus";
import { Pitcher } from "@/features/pitchers/types/pitcher";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { createLeaguesFromTeams } from "@/utils/league";
import { Leagues } from "@/types/league";
import LeagueDivisionsList from "@/features/teams/components/league-divisions-list";
import { Team } from "@/features/teams/types/team";
import SelectPitchersDialog from "@/features/pitchers/components/select-pitchers-dialog";
import { Button } from "@/components/ui/button/button";
import SavePitchersDialog from "@/features/pitchers/components/save-pitchers-dialog";
import CenterButtonBox from "@/components/ui/button-box/center-button-box/center-button-box";

export default function Pitchers() {
  const { liff, liffError } = useLiffContext();
  const { teams, isLoading, error } = useTeams();
  const [leagues, setLeagues] = useState<Leagues>();
  const [selectedTeam, setSelectedTeam] = useState<Team>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pitchers, setPitchers] = useState<Pitcher[]>([]);
  const [isPitchersLoading, setIsPitchersLoading] = useState(false);
  const [selectedPitchers, setSelectedPitchers] = useState<Pitcher[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getLeagues = () => {
    if (!teams) { return; }
    const newLeagues = createLeaguesFromTeams(teams);
    setLeagues(newLeagues);
  }

  const handleTeamCardClick = async (team: Team) => {
    setSelectedTeam(team);
    setDialogOpen(true);
    setIsPitchersLoading(true);
    try {
      const response = await fetch(`https://statsapi.mlb.com/api/v1/teams/${team.id}/roster/40Man`);
      const data = await response.json();
      const roster = data.roster;
      const pitcherMap = new Map<number, Pitcher>();

      for (const player of roster) {
        if (player.position.code !== POSITION.pitcher.code) continue;

        const id = player.person.id;
        const status = PLAYER_STATUS[player.status.code as keyof typeof PLAYER_STATUS]
          ? player.status.code
          : '';

        const pitcher: Pitcher = {
          id,
          name: player.person.fullName,
          teamName: team.name,
          status,
          image: `https://img.mlbstatic.com/mlb-photos/image/upload/w_60,d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/${id}/headshot/67/current`,
        };

        const duplicatePitcher = pitcherMap.get(id);
        
        if (duplicatePitcher) {
          const duplicatePitcherStatus = PLAYER_STATUS[duplicatePitcher.status];

          if (PLAYER_STATUS[pitcher.status].priority > duplicatePitcherStatus.priority) {
            pitcherMap.set(id, pitcher);
          }
        } else {
          pitcherMap.set(id, pitcher);
        }
      }

      const sortedPitchers = Array.from(pitcherMap.values()).sort(
        (a, b) =>
          (PLAYER_STATUS[b.status].priority ?? 0) - (PLAYER_STATUS[a.status].priority ?? 0)
      );
      setPitchers(sortedPitchers);
    } catch (error) {
      console.error(error);
      setPitchers([]);
    } finally {
      setIsPitchersLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTeam(undefined);
    setPitchers([]);
  };

  const handlePitcherToggle = (pitcher: Pitcher) => {
    setSelectedPitchers((prev) =>
      prev.some((prevPitcher) => prevPitcher.id === pitcher.id)
        ? prev.filter((prevPitcher) => prevPitcher.id !== pitcher.id)
        : [...prev, pitcher]
    );
  };

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
      {/* [start]チーム一覧 */}
      {leagues && Object.entries(LEAGUE_DISPLAY_ORDER).map(([leagueId, divisionOrder]) => {
        return (
          <LeagueDivisionsList
            key={leagueId}
            league={leagues[leagueId]}
            divisionOrder={divisionOrder}
            selectedTeamIds={selectedTeam ? [selectedTeam.id] : []}
            handleTeamCardClick={handleTeamCardClick}
          />
        );
      })}
      {/* [end]チーム一覧 */}

      {/* [start]ピッチャー一覧ダイアログ */}
      {selectedTeam && (
        <SelectPitchersDialog
          isOpen={dialogOpen}
          onClose={handleDialogClose}
          team={selectedTeam}
          isPitchersLoading={isPitchersLoading}
          pitchers={pitchers}
          selectedPitchers={selectedPitchers}
          handlePitcherToggle={handlePitcherToggle}
        />
      )}
      {/* [end]ピッチャー一覧ダイアログ */}

      {/* [start]確認ボタン */}
      <CenterButtonBox>
        <Button
          disabled={confirmOpen}
          onClick={() => setConfirmOpen(true)}
        >
          選択した{selectedPitchers.length}人を保存
        </Button>
      </CenterButtonBox>
      {/* [end]確認ボタン */}

      {/* [start]確認ダイアログ */}
      <SavePitchersDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        selectedPitchers={selectedPitchers}
      />
      {/* [end]確認ダイアログ */}
    </Box>
  );
}
