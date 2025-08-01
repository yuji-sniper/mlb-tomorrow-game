import { Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar } from "@mui/material";
import { Team } from "../../../shared/types/team";
import SaveDialog from "@/shared/components/ui/dialog/save-dialog/save-dialog";
import { Button } from "@/shared/components/ui/button/button";
import { useState } from "react";

type SaveTeamsDialogProps = {
  title?: string;
  buttonLabel?: string;
  selectedTeams: Team[];
  onSubmit: () => void;
}

export default function SaveTeamsDialog({
  title = "選択したチームを保存しますか？",
  buttonLabel = "選択したチームを保存",
  selectedTeams,
  onSubmit,
}: SaveTeamsDialogProps) {
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
                <ListItemText primary={team.teamName} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography align="center" color="text.secondary">
            未選択
          </Typography>
        )}
      </SaveDialog>
    </>
  );
}
