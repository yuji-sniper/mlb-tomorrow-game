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
        width: 54,
        flex: "0 0 auto",
        textAlign: "center",
        cursor: "pointer",
        position: "relative",
        transition: "border-color 0.2s",
        border: "3px solid",
        borderColor: isActive ? "primary.main" : "white",
        bgcolor: "white",
        opacity: isActive ? 0.8 : 1,
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
            width: 32,
            height: 32,
            bgcolor: "white",
            borderRadius: 0,
            objectFit: "contain",
          }}
          variant="square"
          slotProps={{ img: { style: { objectFit: "contain" } } }}
        />
        <Typography
          variant="caption"
          sx={{ mt: 0.2, fontSize: "0.5rem", wordBreak: "break-word" }}
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
