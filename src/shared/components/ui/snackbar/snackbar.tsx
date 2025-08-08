import { Snackbar as MuiSnackbar } from "@mui/material"

type SnackbarProps = {
  open: boolean
  onClose: () => void
  message: string
  status: "success" | "error"
}

export default function Snackbar({
  open,
  onClose,
  message,
  status,
}: SnackbarProps) {
  return (
    <MuiSnackbar
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      open={open}
      onClose={onClose}
      autoHideDuration={3000}
      message={message}
      slotProps={{
        content: {
          sx: {
            backgroundColor: status === "success" ? "#4caf50" : "#f44336",
          },
        },
      }}
    />
  )
}
