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
        '&.Mui-disabled': {
          opacity: 0.5,
          color: 'white',
          backgroundColor: 'grey.500',
        },
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
