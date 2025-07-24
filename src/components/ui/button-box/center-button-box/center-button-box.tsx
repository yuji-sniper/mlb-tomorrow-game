import { Box } from "@mui/material";

type CenterButtonBoxProps = {
  children: React.ReactNode;
}

export default function CenterButtonBox({ children }: CenterButtonBoxProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 4,
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
}
