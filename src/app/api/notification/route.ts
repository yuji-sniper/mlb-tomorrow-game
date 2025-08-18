import { NextResponse } from "next/server"
import { iterateAllUsersByChunkWithRelations } from "@/features/users/repositories/fetch-users-repository"
import {
  issueLineMessagingApiStatelessChannelAccessTokenApi,
  sendLinePushMessageApi,
} from "@/shared/api/line-api"
import {
  fetchGamesByDateApi,
  fetchStandingsApi,
  fetchTeamsApi,
} from "@/shared/api/mlb-api"
import { DIVISION_ABBR_JP } from "@/shared/constants/division"
import { ERROR_CODE } from "@/shared/constants/error"
import { CustomError } from "@/shared/errors/error"
import type { ErrorCode } from "@/shared/types/error"
import type { Game } from "@/shared/types/game"
import type { Standing } from "@/shared/types/standing"
import type { Team } from "@/shared/types/team"
import { runWithConcurrency } from "@/shared/utils/concurrency"
import { getLastName } from "@/shared/utils/name"

type GameMessageData = {
  gameMessage: string
  home: {
    teamId: number
    probablePitcherId?: number
    isInPlayoffSpot: boolean
  }
  away: {
    teamId: number
    probablePitcherId?: number
    isInPlayoffSpot: boolean
  }
}

const GAME_START_TIME_FORMAT_OPTIONS = {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
} as const

const CHUNK_SIZE = 200

const CONCURRENCY = 10

const MAX_RETRY_COUNT = 3

const BASE_JITTER_MS = 250

const BASE_RETRY_INTERVAL_MS = 1000

const RETRYABLE_ERROR_CODES: ErrorCode[] = [
  ERROR_CODE.TOO_MANY_REQUESTS,
  ERROR_CODE.INTERNAL_SERVER_ERROR,
]

/**
 * 通知を送信する
 */
export async function POST() {
  try {
    const { teams, standings, games } = await fetchMlbData()

    const gameMessageDataList = await generateGameMessageDataList(
      teams,
      standings,
      games,
    )

    await sendPushMessagesToUsers(gameMessageDataList)

    return NextResponse.json({ message: "OK" })
  } catch (error) {
    console.error("Notification API Error:", error)

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    )
  }
}

/**
 * MLB APIからデータを取得する
 */
async function fetchMlbData(): Promise<{
  teams: Team[]
  standings: Standing[]
  games: Game[]
}> {
  const teams = await fetchTeamsApi()
  const standings = await fetchStandingsApi()
  const games = await fetchGamesByDateApi(new Date())

  return { teams, standings, games }
}

/**
 * 試合データを通知メッセージのデータに変換する
 */
async function generateGameMessageDataList(
  teams: Team[],
  standings: Standing[],
  games: Game[],
): Promise<GameMessageData[]> {
  const teamsMap = new Map<number, Team>(teams.map((team) => [team.id, team]))
  const standingsMap = new Map<number, Standing>(
    standings.map((standing) => [standing.teamId, standing]),
  )

  const gameMessageDataList: GameMessageData[] = []

  for (const game of games) {
    const startTimeJST = new Date(game.gameDate).toLocaleString("ja-JP", {
      ...GAME_START_TIME_FORMAT_OPTIONS,
    })

    const homeTeam = teamsMap.get(game.home.teamId)
    const awayTeam = teamsMap.get(game.away.teamId)

    if (!homeTeam || !awayTeam) continue

    const homeTeamStanding = standingsMap.get(game.home.teamId)
    const awayTeamStanding = standingsMap.get(game.away.teamId)

    const homeTeamStandingText = generateStandingText(homeTeamStanding)
    const awayTeamStandingText = generateStandingText(awayTeamStanding)

    const homeTeamPitcher = game.home.probablePitcher
    const awayTeamPitcher = game.away.probablePitcher

    const homeTeamPitcherLastName = homeTeamPitcher?.fullName
      ? getLastName(homeTeamPitcher.fullName)
      : " - "
    const awayTeamPitcherLastName = awayTeamPitcher?.fullName
      ? getLastName(awayTeamPitcher.fullName)
      : " - "

    const gameMessage = buildGameMessage(
      startTimeJST,
      homeTeam.teamName,
      homeTeamStandingText,
      homeTeamPitcherLastName,
      awayTeam.teamName,
      awayTeamStandingText,
      awayTeamPitcherLastName,
    )

    const homeInfo = {
      teamId: homeTeam.id,
      probablePitcherId: homeTeamPitcher?.id,
      isInPlayoffSpot: homeTeamStanding?.isInPlayoffSpot ?? false,
    }
    const awayInfo = {
      teamId: awayTeam.id,
      probablePitcherId: awayTeamPitcher?.id,
      isInPlayoffSpot: awayTeamStanding?.isInPlayoffSpot ?? false,
    }

    gameMessageDataList.push({
      gameMessage,
      home: homeInfo,
      away: awayInfo,
    })
  }

  return gameMessageDataList
}

/**
 * 試合メッセージを生成する
 *
 * 【フォーマット】
 * 09:10
 * Yankees(ア東1位｜先発:Fried)
 * Red Sox(ア東2位 WC｜先発:Crochet)
 */
function buildGameMessage(
  startTimeJST: string,
  homeTeamName: string,
  homeTeamStandingText: string,
  homeTeamPitcherLastName: string,
  awayTeamName: string,
  awayTeamStandingText: string,
  awayTeamPitcherLastName: string,
): string {
  const message = [
    `【🕐${startTimeJST}】`,
    `${homeTeamName}（${homeTeamStandingText}）`,
    `先発：${homeTeamPitcherLastName}`,
    "    [vs]",
    `${awayTeamName}（${awayTeamStandingText}）`,
    `先発：${awayTeamPitcherLastName}`,
  ].join("\n")

  return message
}

/**
 * 順位テキスト生成関数（ex:「ア東１位」、「ア東２位 WC」など）
 */
function generateStandingText(standing?: Standing): string {
  const defaultText = " - "

  if (!standing) return defaultText

  const divisionAbbr =
    DIVISION_ABBR_JP[standing.divisionId as keyof typeof DIVISION_ABBR_JP] ??
    undefined

  if (!divisionAbbr) return defaultText

  const divisionRankText = `${divisionAbbr}${standing.divisionRank}位`

  return standing.isWildCardLeader ? `${divisionRankText} WC` : divisionRankText
}

/**
 * ユーザーごとに通知メッセージを送信する
 */
async function sendPushMessagesToUsers(
  gameMessageDataList: GameMessageData[],
): Promise<void> {
  const channelAccessToken =
    await issueLineMessagingApiStatelessChannelAccessTokenApi()

  let totalCount = 0
  let successCount = 0
  let errorCount = 0
  let skipCount = 0

  for await (const users of iterateAllUsersByChunkWithRelations(CHUNK_SIZE, {
    players: true,
    teams: true,
  })) {
    const tasks: (() => Promise<void>)[] = users.map((user) => async () => {
      try {
        const registeredTeamIds = user.teams?.map((team) => team.teamId) ?? []
        const registeredPlayerIds =
          user.players?.map((player) => player.playerId) ?? []

        const message = buildMessageForUser(
          gameMessageDataList,
          registeredTeamIds,
          registeredPlayerIds,
        )

        if (!message) {
          skipCount++
          return
        }

        await sendWithRetry({
          channelAccessToken: channelAccessToken.access_token,
          to: user.lineId,
          messages: [{ type: "text", text: message }],
        })

        successCount++
      } catch (error) {
        console.error(
          `Failed to send LINE message: (userId: ${user.id})`,
          error,
        )

        errorCount++
      } finally {
        totalCount++
      }
    })

    await runWithConcurrency<void>(tasks, CONCURRENCY)
  }

  console.log(
    "[API: POST /api/notification]",
    `Total: ${totalCount}`,
    `Success: ${successCount}`,
    `Error: ${errorCount}`,
    `Skip: ${skipCount}`,
  )
}

/**
 * ユーザーごとに通知対象の試合を判定して通知メッセージを生成する
 */
function buildMessageForUser(
  gameMessageDataList: GameMessageData[],
  registeredTeamIds: number[],
  registeredPlayerIds: number[],
): string {
  const gameMessages: string[] = []

  gameMessageDataList.forEach((data) => {
    const shouldNotify = shouldNotifyGameToUser(
      data,
      registeredTeamIds,
      registeredPlayerIds,
    )

    if (shouldNotify) {
      gameMessages.push(data.gameMessage)
    }
  })

  return gameMessages.join("\n\n")
}

/**
 * ユーザーの登録データと試合データをもとに、通知対象の試合かどうかを判定する
 */
function shouldNotifyGameToUser(
  gameMessageData: GameMessageData,
  registeredTeamIds: number[],
  registeredPlayerIds: number[],
): boolean {
  // [ホームチーム] 登録チームかどうか / 先発が登録選手かどうか / プレーオフ圏内かどうか
  const isHomeTeamRegistered = registeredTeamIds.includes(
    gameMessageData.home.teamId,
  )
  const isHomeTeamPitcherRegistered = gameMessageData.home.probablePitcherId
    ? registeredPlayerIds.includes(gameMessageData.home.probablePitcherId)
    : false
  const isHomeTeamInPlayoffSpot = gameMessageData.home.isInPlayoffSpot

  // [アウェーチーム] 登録チームかどうか / 先発が登録選手かどうか / プレーオフ圏内かどうか
  const isAwayTeamRegistered = registeredTeamIds.includes(
    gameMessageData.away.teamId,
  )
  const isAwayTeamPitcherRegistered = gameMessageData.away.probablePitcherId
    ? registeredPlayerIds.includes(gameMessageData.away.probablePitcherId)
    : false
  const isAwayTeamInPlayoffSpot = gameMessageData.away.isInPlayoffSpot

  // 登録チームの相手チームがプレーオフ圏内なら通知対象とする
  const isHomeTeamTarget = isHomeTeamRegistered && isAwayTeamInPlayoffSpot
  const isAwayTeamTarget = isAwayTeamRegistered && isHomeTeamInPlayoffSpot

  // 登録ピッチャーの相手チームがプレーオフ圏内なら通知対象とする
  const isHomeTeamPitcherTarget =
    isHomeTeamPitcherRegistered && isAwayTeamInPlayoffSpot
  const isAwayTeamPitcherTarget =
    isAwayTeamPitcherRegistered && isHomeTeamInPlayoffSpot

  // 通知対象の試合かどうか（1つでも条件を満たせば通知対象とする）
  const shouldNotify =
    isHomeTeamTarget ||
    isAwayTeamTarget ||
    isHomeTeamPitcherTarget ||
    isAwayTeamPitcherTarget

  return shouldNotify
}

/**
 * 送信を実行する（失敗時にリトライ）
 */
async function sendWithRetry({
  channelAccessToken,
  to,
  messages,
}: {
  channelAccessToken: string
  to: string
  messages: { type: string; text: string }[]
}): Promise<void> {
  const retryKey = crypto.randomUUID()

  let attemptCount = 0

  while (true) {
    try {
      await sendLinePushMessageApi(channelAccessToken, retryKey, to, messages)

      break
    } catch (error) {
      attemptCount++

      const isRetryTargetError =
        error instanceof CustomError &&
        RETRYABLE_ERROR_CODES.includes(error.code)

      const shouldRetry = isRetryTargetError && attemptCount <= MAX_RETRY_COUNT

      if (!shouldRetry) {
        throw error
      }

      const jitter = Math.floor(Math.random() * BASE_JITTER_MS)
      const waitMs = BASE_RETRY_INTERVAL_MS * 2 ** (attemptCount - 1) + jitter

      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }
  }
}
