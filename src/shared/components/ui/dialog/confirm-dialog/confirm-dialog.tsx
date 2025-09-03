import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { CenterSpinner } from "../../spinner/center-spinner/center-spinner"

type ConfirmDialogProps = {
  title: string
  cancelLabel?: string
  submitLabel?: string
  isOpen: boolean
  isLoading?: boolean
  isCancelDisabled?: boolean
  isSubmitDisabled?: boolean
  onCancel: () => void
  onSubmit: () => void
  children: React.ReactNode
}

export default function ConfirmDialog({
  title,
  cancelLabel = "キャンセル",
  submitLabel,
  isOpen,
  isLoading,
  isCancelDisabled,
  isSubmitDisabled,
  onCancel,
  onSubmit,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle fontSize="1rem" textAlign="center" sx={{ p: 1.5 }}>
        {title}
      </DialogTitle>

      <DialogContent dividers>
        {isLoading && <CenterSpinner />}
        {children}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color="inherit" disabled={isCancelDisabled}>
          {cancelLabel}
        </Button>

        <Button
          onClick={onSubmit}
          color="primary"
          variant="contained"
          disabled={isSubmitDisabled}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
