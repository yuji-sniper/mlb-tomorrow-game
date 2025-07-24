import { PLAYER_STATUS } from "@/constants/playerStatus";

export type Pitcher = {
  id: number;
  name: string;
  teamName: string;
  status: keyof typeof PLAYER_STATUS;
  image: string;
}
