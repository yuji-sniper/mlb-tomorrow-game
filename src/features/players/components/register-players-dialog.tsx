import SaveDialog from "@/shared/components/ui/dialog/save-dialog/save-dialog";
import { List, ListItem, ListItemAvatar, ListItemText, Typography, Avatar } from "@mui/material";
import { PLAYER_STATUS } from "@/shared/constants/player-status";
import { Player } from "@/shared/types/player";
import { Button } from "@/shared/components/ui/button/button";
import { useState } from "react";
import { generatePlayerImageUrl } from "../utils/player-image";

type RegisterPlayersDialogProps = {
  title: string;
  buttonLabel: string;
  players: Player[];
  onSubmit: () => void;
}

export default function RegisterPlayersDialog({
  title,
  buttonLabel,
  players,
  onSubmit,
}: RegisterPlayersDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        disabled={isOpen}
        onClick={() => setIsOpen(true)}
      >
        {buttonLabel}
      </Button>

      <SaveDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={onSubmit}
        title={title}
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
                <ListItemText
                  primary={player.name}
                  secondary={
                    player.team
                      ? `[${player.team.teamName}] ${PLAYER_STATUS[player.statusCode].display}`
                      : `${PLAYER_STATUS[player.statusCode].display}`
                  }
                  slotProps={{
                    secondary: { sx: { fontSize: '0.6rem' } },
                  }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography align="center" color="text.secondary">未選択</Typography>
        )}
      </SaveDialog>
    </>
  )
}
