import { PLAYER_STATUS } from "@/shared/constants/player-status";

export type PlayerStatusCode = keyof typeof PLAYER_STATUS;

export type Player = {
  id: number;
  teamId: number;
  name: string;
  positionCode: string;
  statusCode: PlayerStatusCode;
}
