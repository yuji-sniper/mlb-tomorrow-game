import { PLAYER_STATUS } from "@/shared/constants/player-status"
import type { Game } from "@/shared/types/game"
import type { Player, PlayerStatusCode } from "@/shared/types/player"
import type { Standing } from "@/shared/types/standing"
import type { Team } from "@/shared/types/team"

/**
 * チーム一覧を取得する
 */
export async function fetchTeamsApi(): Promise<Team[]> {
  const res = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1")
  if (!res.ok) {
    throw new Error("Failed to fetch teams")
  }

  const data: {
    teams: {
      id: number
      name: string
      teamName: string
      abbreviation: string
      league: { id: number }
      division: { id: number }
    }[]
  } = await res.json()

  return data.teams.map((team) => ({
    id: team.id,
    name: team.name,
    teamName: team.teamName,
    abbreviation: team.abbreviation,
    leagueId: team.league.id,
    divisionId: team.division.id,
  }))
}

/**
 * チームの40人枠ロースターを取得する
 */
export async function fetchTeamRoster40ManApi(
  teamId: number,
): Promise<Player[]> {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster/40Man`,
  )
  if (!res.ok) {
    throw new Error("Failed to fetch team roster")
  }

  const data: {
    roster: {
      person: { id: number; fullName: string }
      parentTeamId: number
      position?: { code: string }
      status: { code: PlayerStatusCode }
    }[]
  } = await res.json()

  const players: Player[] = data.roster.map((player) => {
    const id = player.person.id
    const statusCode = PLAYER_STATUS[player.status.code as PlayerStatusCode]
      ? (player.status.code as PlayerStatusCode)
      : ""
    return {
      id,
      teamId: player.parentTeamId,
      name: player.person.fullName,
      positionCode: player.position?.code || "",
      statusCode,
    }
  })

  return players
}

/**
 * 指定したID群の選手情報を取得する
 */
export async function fetchPlayersByIdsApi(
  personIds: number[],
): Promise<Player[]> {
  if (personIds.length === 0) {
    return []
  }

  const params = new URLSearchParams()
  params.append("personIds", personIds.join(","))
  params.append("hydrate", "currentTeam")

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people?${params.toString()}`,
  )
  if (!res.ok) {
    throw new Error("Failed to fetch people")
  }

  const data: {
    people: {
      id: number
      fullName: string
      currentTeam: { id: number; parentOrgId?: number }
    }[]
  } = await res.json()

  const players: Player[] = data.people.map((person) => ({
    id: person.id,
    teamId: person.currentTeam.parentOrgId ?? person.currentTeam.id,
    name: person.fullName,
    positionCode: "",
    statusCode: "",
  }))

  return players
}

/**
 * 順位データを取得する
 */
export async function fetchStandingsApi(): Promise<Standing[]> {
  const params = new URLSearchParams()
  params.append("sportId", "1")
  params.append("leagueId", "103,104")
  params.append("season", new Date().getFullYear().toString())
  params.append(
    "fields",
    "records,league,id,division,id,teamRecords,team,id,divisionRank,wildCardLeader",
  )

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/standings?${params.toString()}`,
  )
  if (!res.ok) {
    throw new Error("Failed to fetch standings")
  }

  const data: {
    records: {
      league: { id: number }
      division: { id: number }
      teamRecords: {
        team: { id: number }
        divisionRank: string
        wildCardLeader?: boolean
      }[]
    }[]
  } = await res.json()

  const standings: Standing[] = []

  data.records.forEach((record) => {
    const leagueId = record.league.id
    const divisionId = record.division.id

    record.teamRecords.forEach((teamRecord) => {
      const divisionRank = teamRecord.divisionRank
      const isWildCardLeader = teamRecord.wildCardLeader ?? false
      const isInPlayoffSpot = divisionRank === "1" || isWildCardLeader

      standings.push({
        teamId: teamRecord.team.id,
        leagueId,
        divisionId,
        divisionRank,
        isWildCardLeader,
        isInPlayoffSpot,
      })
    })
  })

  return standings
}

/**
 * 指定した日付の試合データを取得する
 */
export async function fetchGamesByDateApi(date: Date): Promise<Game[]> {
  const dateString = date.toISOString().split("T")[0]

  const params = new URLSearchParams()
  params.append("sportId", "1")
  params.append("date", dateString)
  params.append("hydrate", "probablePitcher")
  params.append(
    "fields",
    "dates,games,gameDate,teams,away,home,team,id,probablePitcher,id,fullName",
  )

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/schedule?${params.toString()}`,
  )
  if (!res.ok) {
    throw new Error("Failed to fetch games")
  }

  const data: {
    dates: {
      games: {
        gamePk: number
        gameDate: string
        teams: {
          home: {
            team: { id: number; name: string }
            probablePitcher?: { id: number; fullName: string }
          }
          away: {
            team: { id: number; name: string }
            probablePitcher?: { id: number; fullName: string }
          }
        }
      }[]
    }[]
  } = await res.json()

  const games: Game[] = []
  data.dates[0].games.forEach((game) => {
    games.push({
      gamePk: game.gamePk,
      gameDate: game.gameDate, // フォーマット: 2025-08-16T18:20:00Z
      home: {
        teamId: game.teams.home.team.id,
        probablePitcher: game.teams.home.probablePitcher,
      },
      away: {
        teamId: game.teams.away.team.id,
        probablePitcher: game.teams.away.probablePitcher,
      },
    })
  })

  return games
}
