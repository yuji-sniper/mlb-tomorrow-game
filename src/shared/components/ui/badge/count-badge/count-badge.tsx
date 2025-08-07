import { Box } from '@mui/material';

type CountBadgeProps = {
  count: number;
  size?: number;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
};

export const CountBadge = ({
  count,
  size = 16,
  fontSize = '0.7rem',
  color = 'white',
  backgroundColor = 'primary.main',
}: CountBadgeProps) => {
  const sx = {
    width: size,
    height: size,
    fontSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
    backgroundColor,
    borderRadius: '50%',
    border: `1.5px solid ${color}`,
  };
  
  return (
    <Box sx={sx}>
      {count}
    </Box>
  );
}
