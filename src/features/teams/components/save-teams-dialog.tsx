import { Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar } from "@mui/material";
import { Team } from "../types/team";
import SaveDialog from "@/components/ui/dialog/save-dialog/save-dialog";

type SaveTeamsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTeams: Team[];
}

export default function SaveTeamsDialog({
  isOpen,
  onClose,
  selectedTeams,
}: SaveTeamsDialogProps) {
  return (
    <SaveDialog
      isOpen={isOpen}
      onClose={onClose}
      onSave={() => {}}
      title="選択したチームを保存しますか？"
    >
      {selectedTeams.length > 0 ? (
        <List dense sx={{ p: 0 }}>
          {selectedTeams.map((team) => (
            <ListItem key={team.id}>
              <ListItemAvatar>
                <Avatar
                  src={team.image}
                  alt={team.name}
                  sx={{ width: 32, height: 32, mb: 0.5, bgcolor: 'white', borderRadius: 0, objectFit: 'contain' }}
                  variant="square"
                  slotProps={{
                    img: {
                      style: { objectFit: 'contain' },
                    },
                  }}
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
    </SaveDialog>
  );
}
