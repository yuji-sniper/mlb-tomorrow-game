import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material"
import SaveDialog from "@/shared/components/ui/dialog/save-dialog/save-dialog"
import type { Player } from "@/shared/types/player"
import { generatePlayerImageUrl } from "../utils/player-image"

type RegisterPlayersDialogProps = {
  isOpen: boolean
  onCancel?: () => void
  title: string
  players: Player[]
  onSubmit: () => Promise<void>
  disabled?: boolean
}

export default function RegisterPlayersDialog({
  isOpen,
  onCancel,
  title,
  players,
  onSubmit,
  disabled = false,
}: RegisterPlayersDialogProps) {
  return (
    <SaveDialog
      isOpen={isOpen}
      onCancel={onCancel ?? (() => {})}
      onSubmit={onSubmit}
      title={title}
      disabled={disabled}
    >
      {players.length > 0 ? (
        <List dense sx={{ p: 0 }}>
          {players.map((player) => (
            <ListItem key={player.id}>
              <ListItemAvatar>
                <Avatar
                  src={generatePlayerImageUrl(player.id)}
                  alt={player.name}
                  sx={{ width: 40, height: 40 }}
                />
              </ListItemAvatar>
              <ListItemText primary={player.name} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography align="center" color="text.secondary">
          未選択
        </Typography>
      )}
    </SaveDialog>
  )
}
