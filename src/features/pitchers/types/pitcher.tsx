import { PLAYER_STATUS } from "@/constants/playerStatus";

export type Pitcher = {
  id: number;
  name: string;
  teamId: number;
  teamName: string;
  status: keyof typeof PLAYER_STATUS;
  image: string;
}
