import { CircularProgress, Box } from "@mui/material";

interface FullScreenSpinnerProps {
  size?: number;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

export function FullScreenSpinner({ 
  size = 40, 
  color = "primary" 
}: FullScreenSpinnerProps) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100%"
    >
      <CircularProgress size={size} color={color} />
    </Box>
  );
}
