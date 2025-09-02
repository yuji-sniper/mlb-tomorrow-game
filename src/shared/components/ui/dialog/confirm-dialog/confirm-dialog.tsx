import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { CenterSpinner } from "../../spinner/center-spinner/center-spinner"

type ConfirmDialogProps = {
  isOpen: boolean
  isLoading?: boolean
  title: string
  cancelLabel?: string
  submitLabel?: string
  disabled?: boolean
  onCancel: () => void
  onSubmit: () => void
  children: React.ReactNode
}

export default function ConfirmDialog({
  isOpen,
  isLoading,
  title,
  cancelLabel = "キャンセル",
  submitLabel,
  disabled,
  onCancel,
  onSubmit,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle fontSize="0.8rem" textAlign="center" sx={{ p: 1.5 }}>
        {title}
      </DialogTitle>

      <DialogContent dividers>
        {isLoading && <CenterSpinner />}
        {children}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color="inherit" disabled={disabled}>
          {cancelLabel}
        </Button>

        <Button
          onClick={onSubmit}
          color="primary"
          variant="contained"
          disabled={disabled}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
