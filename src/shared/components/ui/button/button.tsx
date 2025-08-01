import { Button as MuiButton, ButtonProps } from "@mui/material";

export function Button({ children, ...props }: ButtonProps) {
  return (
    <MuiButton
      variant="contained"
      color="primary"
      sx={{
        minWidth: 180,
        fontWeight: 'bold',
        fontSize: '1rem',
        boxShadow: 3,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
