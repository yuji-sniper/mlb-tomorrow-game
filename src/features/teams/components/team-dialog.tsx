import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { CenterSpinner } from "@/shared/components/ui/spinner/center-spinner/center-spinner"
import type { Team } from "@/shared/types/team"
import { generateTeamImageUrl } from "../utils/team-image"

type TeamDialogProps = {
  team: Team
  closeLabel?: string
  submitLabel?: string
  isOpen: boolean
  isLoading: boolean
  closeDisabled?: boolean
  submitDisabled?: boolean
  onClose: () => void
  onSubmit: () => void
  children: React.ReactNode
}

export default function TeamDialog({
  team,
  closeLabel = "キャンセル",
  submitLabel = "保存",
  isOpen,
  isLoading,
  closeDisabled,
  submitDisabled,
  onClose,
  onSubmit,
  children,
}: TeamDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ py: 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          {team && (
            <Avatar
              src={generateTeamImageUrl(team.id)}
              alt={team.name}
              variant="square"
              sx={{ width: 32, height: 32 }}
              slotProps={{ img: { style: { objectFit: "contain" } } }}
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? <CenterSpinner /> : children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={closeDisabled}>
          {closeLabel}
        </Button>
        <Button
          onClick={onSubmit}
          color="primary"
          variant="contained"
          disabled={submitDisabled}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
