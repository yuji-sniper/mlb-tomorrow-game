import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

type DefaultDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeLabel?: string;
}

export default function DefaultDialog({
  isOpen,
  onClose,
  title,
  children,
  closeLabel = 'キャンセル',
}: DefaultDialogProps) {  
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontSize="1rem">
        {title}
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {closeLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
