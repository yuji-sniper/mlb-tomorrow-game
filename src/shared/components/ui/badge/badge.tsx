import { CheckCircle } from "@mui/icons-material"
import type { BadgeType } from "@/shared/constants/badge"

type BadgeProps = {
  type: BadgeType
  size?: number
  color?: string
}

export const Badge = ({ type, size = 16 }: BadgeProps) => {
  const sx = {
    width: size,
    height: size,
    backgroundColor: "white",
    borderRadius: "50%",
  }

  switch (type) {
    default:
      return <CheckCircle sx={{ ...sx, color: "primary.main" }} />
  }
}
