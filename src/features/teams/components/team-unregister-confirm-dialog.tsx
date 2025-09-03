import { Avatar, Box, Typography } from "@mui/material"
import ConfirmDialog from "@/shared/components/ui/dialog/confirm-dialog/confirm-dialog"
import type { Team } from "@/shared/types/team"
import { generateTeamImageUrl } from "../utils/team-image"

type TeamUnregisterConfirmDialogProps = {
  isOpen: boolean
  onCancel: () => void
  onSubmit: () => void
  isSubmitDisabled: boolean
  selectedTeam?: Team
}

export default function TeamUnregisterConfirmDialog({
  isOpen,
  onCancel,
  onSubmit,
  isSubmitDisabled,
  selectedTeam,
}: TeamUnregisterConfirmDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onCancel={onCancel}
      title="チームの登録を解除しますか？"
      submitLabel="解除"
      onSubmit={onSubmit}
      isSubmitDisabled={isSubmitDisabled}
    >
      {selectedTeam ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Avatar
            src={generateTeamImageUrl(selectedTeam.id)}
            alt={selectedTeam.name}
            variant="square"
            slotProps={{
              img: {
                style: {
                  objectFit: "contain",
                  WebkitTouchCallout: "none",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                },
              },
            }}
          />
          <Typography variant="body1">{selectedTeam.name}</Typography>
        </Box>
      ) : (
        <Typography variant="body1">チームが選択されていません</Typography>
      )}
    </ConfirmDialog>
  )
}
