import SaveDialog from "@/components/ui/dialog/save-dialog/save-dialog";
import { Pitcher } from "../types/pitcher";
import { List, ListItem, ListItemAvatar, ListItemText, Typography, Avatar } from "@mui/material";
import { PLAYER_STATUS } from "@/constants/playerStatus";

type SavePitchersDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedPitchers: Pitcher[];
}

export default function SavePitchersDialog({
  isOpen,
  onClose,
  selectedPitchers,
}: SavePitchersDialogProps) {
  return (
    <SaveDialog
      isOpen={isOpen}
      onClose={onClose}
      onSave={() => {}}
      title="選択したピッチャーを保存しますか？"
    >
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
  )
}
