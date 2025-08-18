import { Box } from "@mui/material"

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box p={2} maxWidth={450} mx="auto">
      {children}
    </Box>
  )
}
