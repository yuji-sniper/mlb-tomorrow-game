import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

type SaveDialogProps = {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  title: string;
  children: React.ReactNode;
  saveLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
}

export default function SaveDialog({
  isOpen,
  onCancel,
  onSubmit,
  title,
  children,
  saveLabel = '保存',
  cancelLabel = 'キャンセル',
  disabled = false,
}: SaveDialogProps) {  
  return (
    <Dialog open={isOpen} maxWidth="xs" fullWidth>
      <DialogTitle fontSize="1rem" sx={{ p: 1.5 }}>
        {title}
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          color="inherit"
          disabled={disabled}
          sx={{
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onSubmit}
          color="primary"
          variant="contained"
          disabled={disabled}
        >
          {saveLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
