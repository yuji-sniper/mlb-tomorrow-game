import {
  Avatar,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material"
import TeamDialog from "@/features/teams/components/team-dialog"
import { PLAYER_STATUS } from "@/shared/constants/player-status"
import type { Player } from "@/shared/types/player"
import type { Team } from "@/shared/types/team"
import { generatePlayerImageUrl } from "../utils/player-image"

type PlayersRegisterDialogProps = {
  team: Team
  players: Player[]
  isOpen: boolean
  isLoading: boolean
  closeDisabled: boolean
  submitDisabled: boolean
  isPlayerActive: (playerId: Player["id"]) => boolean
  onPlayerClick: (player: Player) => void
  onClose: () => void
  onSubmit: () => void
}

export default function PlayersRegisterDialog({
  team,
  players,
  isOpen,
  isLoading,
  closeDisabled,
  submitDisabled,
  isPlayerActive,
  onPlayerClick,
  onClose,
  onSubmit,
}: PlayersRegisterDialogProps) {
  return (
    <TeamDialog
      team={team}
      isOpen={isOpen}
      isLoading={isLoading}
      closeDisabled={closeDisabled}
      submitDisabled={submitDisabled}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {players.length === 0 ? (
        <Typography align="center" color="text.secondary">
          選択可能な選手がいません
        </Typography>
      ) : (
        <List dense sx={{ p: 0, maxWidth: 280, mx: "auto" }}>
          {players.map((player) => {
            const isSelected = isPlayerActive(player.id)
            return (
              <ListItem
                key={player.id}
                component="div"
                secondaryAction={
                  <Checkbox edge="end" checked={isSelected} color="primary" />
                }
                sx={{
                  bgcolor: isSelected ? "action.selected" : undefined,
                  borderRadius: 1,
                  cursor: "pointer",
                }}
                onClick={() => onPlayerClick(player)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={generatePlayerImageUrl(player.id)}
                    alt={player.name}
                    sx={{ width: 40, height: 40 }}
                    slotProps={{
                      img: {
                        draggable: false,
                        style: {
                          WebkitTouchCallout: "none",
                          WebkitUserSelect: "none",
                          userSelect: "none",
                        },
                      },
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondary={PLAYER_STATUS[player.statusCode].display}
                  slotProps={{
                    secondary: {
                      sx: { fontSize: "0.6rem" },
                    },
                  }}
                />
              </ListItem>
            )
          })}
        </List>
      )}
    </TeamDialog>
  )
}
