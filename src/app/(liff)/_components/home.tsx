import { LEAGUE } from "@/constants/league";
import { useLiffContext } from "@/hooks/useLiffContext";
import { 
  Avatar, 
  CircularProgress,
  Typography,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import { useEffect, useState } from "react";

type Team = {
  id: number;
  name: string;
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

export default function Home() {
  const { liff, liffError } = useLiffContext();
  const [isLoading, setIsLoading] = useState(true);
  const [groupedTeams, setGroupedTeams] = useState<GroupedTeams>();

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

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="200px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      {groupedTeams && Object.entries(groupedTeams).map(([leagueId, league]) => (
        <Box key={leagueId} mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            {league.name}
          </Typography>
          {Object.entries(league.divisions).map(([divisionId, division]) => (
            <Box key={divisionId} mb={3}>
              <Typography variant="subtitle2" fontWeight="medium" mb={1} sx={{ pl: 0.5 }}>
                {division.name}
              </Typography>
              <Box display="flex" flexDirection="row" flexWrap="wrap" gap={0.5} justifyContent="center">
                {division.teams.map((team) => (
                  <Card key={team.id} sx={{ minWidth: 56, maxWidth: 64, flex: '0 0 auto', textAlign: 'center' }}>
                    <CardContent sx={{ p: 0.5, '&:last-child': { pb: 0.5 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar 
                        src={team.image} 
                        alt={team.name} 
                        sx={{ width: 32, height: 32, mb: 0.5, bgcolor: 'white', borderRadius: 0, objectFit: 'contain' }} 
                        variant="square"
                        slotProps={{ img: { style: { objectFit: 'contain' } } }}
                      />
                      <Typography variant="caption" sx={{ mt: 0.2, fontSize: '0.65rem', wordBreak: 'break-word' }}>
                        {team.name}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ))}
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
