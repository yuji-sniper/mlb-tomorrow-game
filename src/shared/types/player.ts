import { PLAYER_STATUS } from "@/shared/constants/player-status";

export type Player = {
  id: number;
  teamId: number;
  name: string;
  positionCode: string;
  statusCode: keyof typeof PLAYER_STATUS;
}
