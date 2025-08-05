import { RemoveCircle } from "@mui/icons-material";

type RemoveBadgeProps = {
  size?: number;
  color?: string;
};

export const RemoveBadge = ({
  size = 18,
  color = 'error.main',
}: RemoveBadgeProps) => (
  <RemoveCircle
    sx={{
      width: size,
      height: size,
      color,
      backgroundColor: 'white',
      borderRadius: '50%',
    }}
  />
);
