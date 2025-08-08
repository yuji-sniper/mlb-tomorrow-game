import { Button as MuiButton } from "@mui/material"

type ButtonProps = {
  text: string
  variant?: "contained" | "outlined"
  disabled?: boolean
  onClick?: () => void
}

export function Button({
  text,
  variant = "contained",
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <MuiButton
      variant={variant}
      color="primary"
      sx={{
        minWidth: 180,
        fontWeight: "bold",
        fontSize: "1rem",
        boxShadow: 3,
        "&.Mui-disabled":
          variant === "contained"
            ? {
                opacity: 0.5,
                color: "white",
                backgroundColor: "grey.500",
              }
            : {
                opacity: 0.5,
                color: "grey.500",
                borderColor: "grey.500",
              },
      }}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </MuiButton>
  )
}
