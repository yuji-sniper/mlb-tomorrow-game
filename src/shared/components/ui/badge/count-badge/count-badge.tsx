import { Box } from "@mui/material";

type CountBadgeProps = {
  count: number;
  size?: number;
  color?: string;
};

export const CountBadge = ({
  count,
  size = 16,
  color = 'primary.main',
}: CountBadgeProps) => (
  <Box
    sx={{
      width: size,
      height: size,
      color,
      backgroundColor: 'white',
      borderRadius: '50%',
    }}
  >
    {count}
  </Box>
);  
