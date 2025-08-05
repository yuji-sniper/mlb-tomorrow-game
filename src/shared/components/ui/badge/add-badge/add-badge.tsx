import { AddCircle } from "@mui/icons-material";

type AddBadgeProps = {
  size?: number;
  color?: string;
};

export const AddBadge = ({
  size = 18,
  color = 'success.main',
}: AddBadgeProps) => (
  <AddCircle
    sx={{
      width: size,
      height: size,
      color,
      backgroundColor: 'white',
      borderRadius: '50%',
    }}
  />
);
