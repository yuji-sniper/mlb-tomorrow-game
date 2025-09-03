import { Avatar, Box, Typography } from "@mui/material"
import ConfirmDialog from "@/shared/components/ui/dialog/confirm-dialog/confirm-dialog"
import type { Team } from "@/shared/types/team"
import { generateTeamImageUrl } from "../utils/team-image"

type TeamUnregisterConfirmDialogProps = {
  isOpen: boolean
  isCancelDisabled: boolean
  isSubmitDisabled: boolean
  onCancel: () => void
  onSubmit: () => void
  selectedTeam?: Team
}

export default function TeamUnregisterConfirmDialog({
  isOpen,
  isCancelDisabled,
  isSubmitDisabled,
  onCancel,
  onSubmit,
  selectedTeam,
}: TeamUnregisterConfirmDialogProps) {
  return (
    <ConfirmDialog
      title="チームの登録を解除しますか？"
      submitLabel="解除"
      isOpen={isOpen}
      isCancelDisabled={isCancelDisabled}
      isSubmitDisabled={isSubmitDisabled}
      onCancel={onCancel}
      onSubmit={onSubmit}
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
