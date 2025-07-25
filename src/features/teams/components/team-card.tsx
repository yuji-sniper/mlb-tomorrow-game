import { Team } from "@/features/teams/types/team";
import { Card, CardContent, Avatar, Typography } from "@mui/material";
import { Box } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type TeamCardProps = {
  team: Team;
  isSelected: boolean;
  count?: number;
  onClick: () => void;
}

export default function TeamCard({ 
  team, 
  isSelected, 
  count = 0,
  onClick,
}: TeamCardProps) {
  return (
    <Card
      key={team.id}
      onClick={onClick}
      sx={{
        width: 54,
        flex: '0 0 auto',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        bgcolor: 'white',
        transition: 'border-color 0.2s',
        border: '3px solid',
        borderColor: (isSelected || count > 0) ? 'primary.main' : 'white',
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
        {/* [start]選択マーク */}
        {isSelected && (
          <CheckCircleIcon 
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              fontSize: 16,
              color: 'primary.main',
              backgroundColor: 'white',
              pointerEvents: 'none',
              borderRadius: '50%',
            }}
          />
        )}
        {/* [end]選択マーク */}

        {/* [start]カウントバッジ表示 */}
        {count > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              minWidth: 18,
              height: 18,
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 8,
              fontSize: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #fff',
            }}
          >
            {count}
          </Box>
        )}
        {/* [end]カウントバッジ表示 */}
      </CardContent>
    </Card>
  )
}
