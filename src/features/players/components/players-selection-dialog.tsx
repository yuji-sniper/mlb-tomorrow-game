import { List, ListItem, ListItemAvatar, ListItemText, Typography, Checkbox, Avatar } from "@mui/material";
import TeamDialog from "@/features/teams/components/team-dialog";
import { Team } from "@/shared/types/team";
import { PLAYER_STATUS } from "@/shared/constants/player-status";
import { Player } from "@/shared/types/player";
import { generatePlayerImageUrl } from "../utils/player-image";

type TeamPlayersSelectionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  isPlayersLoading: boolean;
  players: Player[];
  selectedPlayers: Player[];
  handlePlayerSelectionToggle: (player: Player) => void;
}

export default function TeamPlayersSelectionDialog({
  isOpen,
  onClose,
  team,
  isPlayersLoading,
  players,
  selectedPlayers,
  handlePlayerSelectionToggle,
}: TeamPlayersSelectionDialogProps) {
  return (
    <TeamDialog
      isOpen={isOpen}
      isLoading={isPlayersLoading}
      onClose={onClose}
      team={team}
    >
      {players.length === 0 ? (
        <Typography align="center" color="text.secondary">
          選択可能な選手がいません
        </Typography>
      ) : (
        <List dense sx={{ p: 0, maxWidth: 280, mx: 'auto' }}>
          {players.map((player) => {
            const isSelected = selectedPlayers.some((p) => p.id === player.id);
            return (
              <ListItem
                key={player.id}
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
                onClick={() => handlePlayerSelectionToggle(player)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={generatePlayerImageUrl(player.id)}
                    alt={player.name}
                    sx={{ width: 40, height: 40 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondary={PLAYER_STATUS[player.statusCode].display}
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
