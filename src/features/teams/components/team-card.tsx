import { Avatar, Box, Card, CardContent, Typography } from "@mui/material"
import type { Team } from "@/shared/types/team"
import { generateTeamImageUrl } from "../utils/team-image"

type TeamCardProps = {
  team: Team
  isActive?: boolean
  badge?: React.ReactNode
  onClick: () => void
}

export default function TeamCard({
  team,
  isActive = false,
  badge = undefined,
  onClick,
}: TeamCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        width: "100%",
        maxWidth: 120,
        minWidth: 54,
        textAlign: "center",
        cursor: "pointer",
        position: "relative",
        transition: "border-color 0.2s",
        border: "3px solid",
        borderColor: isActive ? "primary.main" : "white",
        bgcolor: "white",
        opacity: isActive ? 0.87 : 1,
      }}
    >
      <CardContent
        sx={{
          p: 0.5,
          "&:last-child": { pb: 0 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar
          src={generateTeamImageUrl(team.id)}
          alt={team.teamName}
          sx={{
            width: "60%",
            height: "auto",
            minWidth: 32,
            maxWidth: 48,
            aspectRatio: "1/1",
            bgcolor: "white",
            borderRadius: 0,
            objectFit: "contain",
          }}
          variant="square"
          slotProps={{
            img: {
              draggable: false,
              style: {
                objectFit: "contain",
                width: "100%",
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                userSelect: "none",
              },
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            mt: 0.4,
            fontSize: "0.6rem",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          {team.teamName}
        </Typography>
        <Box
          sx={{
            position: "absolute",
            top: 1,
            right: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {badge}
        </Box>
      </CardContent>
    </Card>
  )
}
