import { PLAYER_STATUS } from "@/shared/constants/player-status"
import type { Player } from "@/shared/types/player"
import type { Team } from "@/shared/types/team"

/**
 * 重複を除外（優先度の高いステータスの方を採用する）
 */
export function removeDuplicatePlayers(players: Player[]): Player[] {
  const playerMap = new Map<number, Player>()

  for (const player of players) {
    const existingPlayer = playerMap.get(player.id)
    if (
      !existingPlayer ||
      PLAYER_STATUS[player.statusCode].priority >
        PLAYER_STATUS[existingPlayer.statusCode].priority
    ) {
      playerMap.set(player.id, player)
    }
  }

  return Array.from(playerMap.values())
}

/**
 * ポジションで絞り込み
 */
export function filterPlayersByPosition(
  players: Player[],
  positionCodes: Player["positionCode"][],
) {
  return players.filter((player) =>
    positionCodes.includes(player.positionCode || ""),
  )
}

/**
 * ステータスの優先度でソート
 */
export function sortPlayersByStatusPriority(players: Player[]): Player[] {
  return players.sort((a, b) => {
    return (
      PLAYER_STATUS[b.statusCode].priority -
      PLAYER_STATUS[a.statusCode].priority
    )
  })
}

/**
 * チームIDでグループ化
 */
export function groupPlayersByTeamId(
  players: Player[],
): Record<Team["id"], Player[]> {
  return players.reduce(
    (acc, player) => {
      acc[player.teamId] = acc[player.teamId] || []
      acc[player.teamId].push(player)
      return acc
    },
    {} as Record<Team["id"], Player[]>,
  )
}
