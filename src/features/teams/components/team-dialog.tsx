import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Avatar, CircularProgress } from "@mui/material";
import { Team } from "@/shared/types/team";
import { generateTeamImageUrl } from "../utils/team-image";

type TeamDialogProps = {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  team: Team;
  children: React.ReactNode;
  closeLabel?: string;
}

export default function TeamDialog({
  isOpen,
  isLoading = false,
  onClose,
  team,
  children,
  closeLabel = '閉じる',
}: TeamDialogProps) {
  return (
    <Dialog open={isOpen} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ py: 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          {team && (
            <Avatar
              src={generateTeamImageUrl(team.id)}
              alt={team.name}
              variant="square"
              sx={{ width: 32, height: 32 }}
              slotProps={{ img: { style: { objectFit: 'contain' } } }}
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : (
          children
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onClose} color="primary" fullWidth>
          {closeLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
