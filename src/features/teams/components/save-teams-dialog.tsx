import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar } from "@mui/material";
import { Team } from "../types/team";

type SaveTeamsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTeams: Team[];
}

export function SaveTeamsDialog({ isOpen, onClose, selectedTeams }: SaveTeamsDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '0.8rem' }}>選択したチームを保存しますか？</DialogTitle>
      <DialogContent dividers>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          キャンセル
        </Button>
        <Button
          onClick={() => {
            onClose();
          }}
          color="primary"
          variant="contained"
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
