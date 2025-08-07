import { Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar } from "@mui/material";
import { Team } from "@/shared/types/team";
import SaveDialog from "@/shared/components/ui/dialog/save-dialog/save-dialog";
import { generateTeamImageUrl } from "../utils/team-image";

type SaveTeamsDialogProps = {
  isOpen: boolean;
  onCancel?: () => void;
  title: string;
  selectedTeams: Team[];
  onSubmit: () => Promise<void>;
  disabled?: boolean;
}

export default function SaveTeamsDialog({
  isOpen,
  onCancel,
  title,
  selectedTeams,
  onSubmit,
  disabled = false,
}: SaveTeamsDialogProps) {
  return (
    <>
      <SaveDialog
        isOpen={isOpen}
        onCancel={onCancel ?? (() => {})}
        onSubmit={onSubmit}
        title={title}
        disabled={disabled}
      >
        {selectedTeams.length > 0 ? (
          <List dense sx={{ p: 0 }}>
            {selectedTeams.map((team) => (
              <ListItem key={team.id}>
                <ListItemAvatar>
                  <Avatar
                    src={generateTeamImageUrl(team.id)}
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
