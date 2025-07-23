import { LEAGUE } from "@/constants/league";
import { useLiffContext } from "@/hooks/useLiffContext";
import { 
  Avatar, 
  CircularProgress,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useEffect, useState } from "react";

type Team = {
  id: number;
  name: string;
  fullName: string;
  image: string;
}

type GroupedTeams = {
  [leagueId: number]: {
    name: string;
    divisions: {
      [divisionId: number]: {
        name: string;
        teams: Team[];
      };
    };
  };
}

export default function Teams() {
  const { liff, liffError } = useLiffContext();
  const [isLoading, setIsLoading] = useState(true);
  const [groupedTeams, setGroupedTeams] = useState<GroupedTeams>();
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getGroupedTeams = async () => {
    try {
      const response = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1");
      const data = await response.json();
      const teams = data.teams;
      const newGroupedTeams = teams.reduce((acc: GroupedTeams, team: any) => {
        const leagueId = team.league.id
        const divisionId = team.division.id
        acc[leagueId].divisions[divisionId].teams.push({
          id: team.id,
          name: team.teamName,
          fullName: team.name,
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

  useEffect(() => {
    getGroupedTeams();
  }, [liff]);

  const handleCardClick = (teamId: number) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

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
    <Box p={2} maxWidth={360} mx="auto">
      {/* [start]チーム選択 */}
      {groupedTeams && Object.entries(groupedTeams).map(([leagueId, league]) => (
        <Box key={leagueId} mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            {league.name}
          </Typography>
          {Object.entries(league.divisions).map(([divisionId, division]) => (
            <Box key={divisionId} mb={2}>
              <Typography variant="subtitle2" fontWeight="medium" mb={1} sx={{ pl: 0.5 }}>
                {division.name}
              </Typography>
              <Box display="flex" flexDirection="row" flexWrap="wrap" gap={0.5} justifyContent="center">
                {division.teams.map((team) => {
                  const selected = selectedTeams.includes(team.id);
                  return (
                    <Card
                      key={team.id}
                      onClick={() => handleCardClick(team.id)}
                      sx={{
                        width: 54,
                        flex: '0 0 auto',
                        textAlign: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        bgcolor: 'white',
                        transition: 'border-color 0.2s',
                        border: '3px solid',
                        borderColor: selected ? 'primary.main' : 'white',
                      }}
                    >
                      <CardContent sx={{ p: 0.5, '&:last-child': { pb: 0.5 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar 
                          src={team.image} 
                          alt={team.name} 
                          sx={{ width: 32, height: 32, mb: 0.5, bgcolor: 'white', borderRadius: 0, objectFit: 'contain' }} 
                          variant="square"
                          slotProps={{ img: { style: { objectFit: 'contain' } } }}
                        />
                        <Typography variant="caption" sx={{ mt: 0.2, fontSize: '0.5rem', wordBreak: 'break-word' }}>
                          {team.name}
                        </Typography>
                        {selected && (
                          <CheckCircleIcon 
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              fontSize: 16,
                              color: 'primary.main',
                              backgroundColor: 'white',
                              pointerEvents: 'none',
                              borderRadius: '50%',
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      ))}
      {/* [end]チーム選択 */}

      {/* [start]保存ボタン */}
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
          選択した{selectedTeams.length}チームを保存
        </Button>
      </Box>
      {/* [end]保存ボタン */}

      {/* [start]確認ダイアログ */}
      <MuiDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <MuiDialogTitle sx={{ fontSize: '1rem' }}>選択したチームを保存しますか？</MuiDialogTitle>
        <MuiDialogContent dividers>
          {selectedTeams.length > 0 ? (
            <List dense sx={{ p: 0 }}>
              {groupedTeams &&
                Object.values(groupedTeams).flatMap((league) =>
                  Object.values(league.divisions).flatMap((division) =>
                    division.teams.filter((team) => selectedTeams.includes(team.id))
                  )
                ).map((team) => (
                  <ListItem key={team.id}>
                    <ListItemAvatar>
                      <Avatar
                        src={team.image}
                        alt={team.name}
                        sx={{ width: 32, height: 32, mb: 0.5, bgcolor: 'white', borderRadius: 0, objectFit: 'contain' }}
                        variant="square"
                        slotProps={{ img: { style: { objectFit: 'contain' } } }}
                      />
                    </ListItemAvatar>
                    <ListItemText primary={team.fullName} />
                  </ListItem>
                ))}
            </List>
          ) : (
            <Typography align="center" color="text.secondary">
              未選択
            </Typography>
          )}
        </MuiDialogContent>
        <MuiDialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">キャンセル</Button>
          <Button
            onClick={() => {
              console.log('保存するチームID:', selectedTeams);
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

const createEmptyGroupedTeams = () => ({
  [LEAGUE.american.id]: {
    name: LEAGUE.american.name,
    divisions: {
      [LEAGUE.american.divisions.east.id]: {
        name: LEAGUE.american.divisions.east.name,
        teams: [],
      },
      [LEAGUE.american.divisions.central.id]: {
        name: LEAGUE.american.divisions.central.name,
        teams: [],
      },
      [LEAGUE.american.divisions.west.id]: {
        name: LEAGUE.american.divisions.west.name,
        teams: [],
      },
    },
  },
  [LEAGUE.national.id]: {
    name: LEAGUE.national.name,
    divisions: {
      [LEAGUE.national.divisions.east.id]: {
        name: LEAGUE.national.divisions.east.name,
        teams: [],
      },
      [LEAGUE.national.divisions.central.id]: {
        name: LEAGUE.national.divisions.central.name,
        teams: [],
      },
      [LEAGUE.national.divisions.west.id]: {
        name: LEAGUE.national.divisions.west.name,
        teams: [],
      },
    },
  },
});
