import type { Team } from "@/shared/types/team"

export type Division = {
  id: number
  name: string
  teams: Team[]
}
