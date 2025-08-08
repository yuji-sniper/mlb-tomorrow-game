import { AddCircle, CheckCircle, RemoveCircle } from "@mui/icons-material"
import type { BadgeType } from "@/shared/constants/badge"
import { BADGE_TYPE } from "@/shared/constants/badge"

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
    case BADGE_TYPE.ADD:
      return <AddCircle sx={{ ...sx, color: "success.main" }} />
    case BADGE_TYPE.REMOVE:
      return <RemoveCircle sx={{ ...sx, color: "error.main" }} />
    default:
      return <CheckCircle sx={{ ...sx, color: "primary.main" }} />
  }
}
