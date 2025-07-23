import { useEffect, useState } from "react";
import { useLiffContext } from "@/hooks/useLiffContext";
import { LEAGUE } from "@/constants/league";
import { Box, Typography, Card, CardContent, Avatar, CircularProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText, Checkbox, DialogActions, Button } from "@mui/material";
import { Dialog as MuiDialog, DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, DialogActions as MuiDialogActions } from "@mui/material";
import { POSITION } from "@/constants/position";
import { PLAYER_STATUS } from "@/constants/playerStatus";

type Team = {
  id: number;
  name: string;
  image: string;
}

type GroupedTeams = {
  [leagueId: string]: {
    name: string;
    divisions: {
      [divisionId: string]: {
        name: string;
        teams: Team[];
      };
    };
  };
}

type Pitcher = {
  id: number;
  name: string;
  teamName: string;
  status: keyof typeof PLAYER_STATUS;
  image: string;
}

type DivisionOrder = {
  [leagueId: string]: string[];
}

const divisionOrder: DivisionOrder = {
  [LEAGUE.american.id]: [
    LEAGUE.american.divisions.east.id.toString(),
    LEAGUE.american.divisions.central.id.toString(),
    LEAGUE.american.divisions.west.id.toString(),
  ],
  [LEAGUE.national.id]: [
    LEAGUE.national.divisions.east.id.toString(),
    LEAGUE.national.divisions.central.id.toString(),
    LEAGUE.national.divisions.west.id.toString(),
  ],
};

export default function Pitchers() {
  const { liff, liffError } = useLiffContext();
  const [isLoading, setIsLoading] = useState(true);
  const [groupedTeams, setGroupedTeams] = useState<GroupedTeams>();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pitchers, setPitchers] = useState<Pitcher[]>([]);
  const [isPitchersLoading, setIsPitchersLoading] = useState(false);
  const [selectedPitchers, setSelectedPitchers] = useState<Pitcher[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getGroupedTeams = async () => {
    try {
      const response = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1");
      const data = await response.json();
      const teams = data.teams;
      const newGroupedTeams = teams.reduce((acc: GroupedTeams, team: any) => {
        const leagueId = team.league.id.toString();
        const divisionId = team.division.id.toString();
        acc[leagueId].divisions[divisionId].teams.push({
          id: team.id,
          name: team.teamName,
          image: `https://www.mlbstatic.com/team-logos/${team.id}.svg`,
        });
        return acc;
      }, createEmptyGroupedTeams());
      setGroupedTeams(newGroupedTeams);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = async (teamId: number, teamName: string) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName);
    setDialogOpen(true);
    setIsPitchersLoading(true);
    try {
      const response = await fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster/40Man`);
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
          teamName: teamName,
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
    setSelectedTeamId(null);
    setSelectedTeamName("");
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
    getGroupedTeams();
  }, [liff]);

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
      {groupedTeams && Object.entries(groupedTeams).map(([leagueId, league]) => (
        <Box key={leagueId} mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {league.name}
          </Typography>
          {divisionOrder[leagueId].map((divisionId) => {
            return (
              <Box key={divisionId} mb={1}>
                <Typography variant="subtitle2" fontSize="0.7rem" fontWeight="medium" mb={0.5} sx={{ pl: 0.5 }}>
                  {league.divisions[divisionId].name}
                </Typography>
                <Box display="flex" flexDirection="row" flexWrap="wrap" gap={0.5} justifyContent="center">
                  {league.divisions[divisionId].teams.map((team) => (
                    <Card
                      key={team.id}
                      onClick={() => handleCardClick(team.id, team.name)}
                      sx={{
                        width: 54,
                        flex: '0 0 auto',
                        textAlign: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        bgcolor: 'white',
                        transition: 'border-color 0.2s',
                        border: '3px solid',
                        borderColor: selectedTeamId === team.id ? 'primary.main' : 'white',
                      }}
                    >
                      <CardContent sx={{ p: 0.5, '&:last-child': { pb: 0 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar 
                          src={team.image} 
                          alt={team.name} 
                          sx={{ width: 32, height: 32, bgcolor: 'white', borderRadius: 0, objectFit: 'contain' }} 
                          variant="square"
                          slotProps={{ img: { style: { objectFit: 'contain' } } }}
                        />
                        <Typography variant="caption" sx={{ mt: 0.2, fontSize: '0.5rem', wordBreak: 'break-word' }}>
                          {team.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      ))}
      {/* [end]チーム一覧 */}

      {/* [start]ピッチャー一覧ダイアログ */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textAlign: 'center', position: 'relative', py: 1 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            {selectedTeamId && (
              <Avatar
                src={`https://www.mlbstatic.com/team-logos/${selectedTeamId}.svg`}
                alt={selectedTeamName}
                variant="square"
                slotProps={{ img: { style: { objectFit: 'contain' } } }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {isPitchersLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
              <CircularProgress />
            </Box>
          ) : pitchers.length === 0 ? (
            <Typography align="center" color="text.secondary">ピッチャー情報がありません</Typography>
          ) : (
            <List dense sx={{ p: 0, maxWidth: 280, mx: 'auto' }}>
              {pitchers.map((pitcher) => (
                <ListItem
                  key={pitcher.id}
                  component="div"
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      onChange={() => handlePitcherToggle(pitcher)}
                      checked={selectedPitchers.some((p) => p.id === pitcher.id)}
                      color="primary"
                    />
                  }
                  sx={{
                    bgcolor: selectedPitchers.some((p) => p.id === pitcher.id) ? 'action.selected' : undefined,
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => handlePitcherToggle(pitcher)}
                >
                  <ListItemAvatar>
                    <Avatar src={pitcher.image} alt={pitcher.name} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={pitcher.name}
                    secondary={PLAYER_STATUS[pitcher.status].display}
                    slotProps={{
                      secondary: {
                        sx: { fontSize: '0.6rem' },
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" fullWidth>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
      {/* [end]ピッチャー一覧ダイアログ */}

      {/* [start]確認ボタン */}
      <Box
        sx={{
          width: { xs: '100%', sm: 360 },
          maxWidth: 480,
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          disabled={confirmOpen}
          onClick={() => setConfirmOpen(true)}
          sx={{
            minWidth: 180,
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: 3,
          }}
        >
          選択中の{selectedPitchers.length}人を保存
        </Button>
      </Box>
      {/* [end]確認ボタン */}

      {/* [start]確認ダイアログ */}
      <MuiDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <MuiDialogTitle sx={{ fontSize: '0.8rem' }}>選択中の選手を保存しますか？</MuiDialogTitle>
        <MuiDialogContent dividers>
          {selectedPitchers.length > 0 ? (
            <List dense sx={{ p: 0 }}>
              {selectedPitchers.map((pitcher) => (
                <ListItem key={pitcher.id}>
                  <ListItemAvatar>
                    <Avatar src={pitcher.image} alt={pitcher.name} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={pitcher.name}
                    secondary={`[${pitcher.teamName}] ${PLAYER_STATUS[pitcher.status].display}`}
                    slotProps={{
                      secondary: {
                        sx: { fontSize: '0.6rem' },
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography align="center" color="text.secondary">未選択</Typography>
          )}
        </MuiDialogContent>
        <MuiDialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">キャンセル</Button>
          <Button
            onClick={() => {
              setConfirmOpen(false);
            }}
            color="primary"
            variant="contained"
          >
            保存
          </Button>
        </MuiDialogActions>
      </MuiDialog>
      {/* [end]確認ダイアログ */}
    </Box>
  );
}

const createEmptyGroupedTeams = (): GroupedTeams => ({
  [LEAGUE.american.id]: {
    name: LEAGUE.american.name,
    divisions: {
      [LEAGUE.american.divisions.east.id.toString()]: {
        name: LEAGUE.american.divisions.east.name,
        teams: [],
      },
      [LEAGUE.american.divisions.central.id.toString()]: {
        name: LEAGUE.american.divisions.central.name,
        teams: [],
      },
      [LEAGUE.american.divisions.west.id.toString()]: {
        name: LEAGUE.american.divisions.west.name,
        teams: [],
      },
    },
  },
  [LEAGUE.national.id]: {
    name: LEAGUE.national.name,
    divisions: {
      [LEAGUE.national.divisions.east.id.toString()]: {
        name: LEAGUE.national.divisions.east.name,
        teams: [],
      },
      [LEAGUE.national.divisions.central.id.toString()]: {
        name: LEAGUE.national.divisions.central.name,
        teams: [],
      },
      [LEAGUE.national.divisions.west.id.toString()]: {
        name: LEAGUE.national.divisions.west.name,
        teams: [],
      },
    },
  },
});
