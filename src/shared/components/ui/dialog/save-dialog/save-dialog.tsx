import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

type SaveDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: React.ReactNode;
  saveLabel?: string;
  cancelLabel?: string;
}

export default function SaveDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  saveLabel = '保存',
  cancelLabel = 'キャンセル',
}: SaveDialogProps) {  
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontSize="1rem" sx={{ p: 1.5 }}>
        {title}
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {cancelLabel}
        </Button>
        <Button onClick={onSubmit} color="primary" variant="contained">
          {saveLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
