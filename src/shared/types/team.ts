import { Player } from "@/shared/types/player";

export type Team = {
  id: number;
  name: string;
  teamName: string;
  image: string;
  leagueId: number;
  divisionId: number;
  players: Player[];
}
