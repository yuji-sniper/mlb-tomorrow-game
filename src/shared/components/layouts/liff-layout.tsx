import { Box } from "@mui/material"

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box p={2} maxWidth={320} mx="auto">
      {children}
    </Box>
  )
}
