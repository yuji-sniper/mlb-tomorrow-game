import { Box, CircularProgress } from "@mui/material"

interface CenterSpinnerProps {
  size?: number
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning"
}

export function CenterSpinner({
  size = 40,
  color = "primary",
}: CenterSpinnerProps) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      width="100%"
    >
      <CircularProgress size={size} color={color} />
    </Box>
  )
}
