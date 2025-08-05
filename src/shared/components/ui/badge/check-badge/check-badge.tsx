import { CheckCircle } from "@mui/icons-material";

type CheckBadgeProps = {
  size?: number;
  color?: string;
};

export const CheckBadge = ({
  size = 16,
  color = 'primary.main',
}: CheckBadgeProps) => (
  <CheckCircle
    sx={{
      width: size,
      height: size,
      color,
      backgroundColor: 'white',
      borderRadius: '50%',
    }}
  />
);
