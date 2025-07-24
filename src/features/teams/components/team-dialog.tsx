import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Avatar } from "@mui/material";
import { Team } from "@/features/teams/types/team";

type TeamDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  children: React.ReactNode;
  closeLabel?: string;
}

export default function TeamDialog({
  isOpen,
  onClose,
  team,
  children,
  closeLabel = '閉じる',
}: TeamDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ py: 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          {team && (
            <Avatar
              src={`https://www.mlbstatic.com/team-logos/${team.id}.svg`}
              alt={team.name}
              variant="square"
              sx={{ width: 32, height: 32 }}
              slotProps={{ img: { style: { objectFit: 'contain' } } }}
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onClose} color="primary">
          {closeLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
