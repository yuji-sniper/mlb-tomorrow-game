import type { Player } from "@/shared/types/player"

export type Team = {
  id: number
  name: string
  teamName: string
  leagueId: number
  divisionId: number
  players?: Player[]
}
