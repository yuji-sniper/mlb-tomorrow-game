import { Box, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Typography, Checkbox, Avatar } from "@mui/material";
import TeamDialog from "@/features/teams/components/team-dialog";
import { Pitcher } from "@/features/pitchers/types/pitcher";
import { Team } from "@/features/teams/types/team";
import { PLAYER_STATUS } from "@/constants/playerStatus";

type SelectPitchersDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  isPitchersLoading: boolean;
  pitchers: Pitcher[];
  selectedPitchers: Pitcher[];
  handlePitcherToggle: (pitcher: Pitcher) => void;
}

export default function SelectPitchersDialog({ isOpen, onClose, team, isPitchersLoading, pitchers, selectedPitchers, handlePitcherToggle }: SelectPitchersDialogProps) {
  return (
    <TeamDialog
      isOpen={isOpen}
      onClose={onClose}
      team={team}
    >
      {isPitchersLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
          <CircularProgress />
        </Box>
      ) : pitchers.length === 0 ? (
        <Typography align="center" color="text.secondary">ピッチャー情報がありません</Typography>
      ) : (
        <List dense sx={{ p: 0, maxWidth: 280, mx: 'auto' }}>
          {pitchers.map((pitcher) => {
            const isSelected = selectedPitchers.some((p) => p.id === pitcher.id);
            return (
              <ListItem
                key={pitcher.id}
                component="div"
                secondaryAction={
                  <Checkbox
                    edge="end"
                    checked={isSelected}
                    color="primary"
                  />
                }
                sx={{
                  bgcolor: isSelected ? 'action.selected' : undefined,
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
            );
          })}
        </List>
      )}
    </TeamDialog>
  )
}
