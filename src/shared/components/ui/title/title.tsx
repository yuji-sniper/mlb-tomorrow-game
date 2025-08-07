import { Box, Typography } from "@mui/material";

export default function Title({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{
      textAlign: 'center',
      mb: 2,
    }}>
      <Typography
        variant="h5"
        component="h1"
        sx={{
          fontWeight: 'bold',
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}
