import { PLAYER_STATUS } from "@/constants/player-status";

export type Pitcher = {
  id: number;
  name: string;
  teamId: number;
  teamName: string;
  status: keyof typeof PLAYER_STATUS;
  image: string;
}
