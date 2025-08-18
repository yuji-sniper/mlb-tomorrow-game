export type Game = {
  gamePk: number
  gameDate: string
  home: {
    teamId: number
    probablePitcher?: {
      id: number
      fullName: string
    }
  }
  away: {
    teamId: number
    probablePitcher?: {
      id: number
      fullName: string
    }
  }
}
