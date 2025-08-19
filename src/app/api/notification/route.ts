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

type ChannelAccessTokenState = {
  token: string
  issuedAt: number
}

const GAME_START_TIME_FORMAT_LOCALE = "ja-JP"

const GAME_START_TIME_FORMAT_OPTIONS = {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
} as const

const GAME_COUNT_PER_MESSAGE = 5

const CHUNK_SIZE = 200

// 送信処理の並列数
const CONCURRENCY = 10

// MEMO: LINE APIのチャネルアクセストークンの有効期限が15分なので、ゆとりを持って10分で再発行する
const CHANNEL_ACCESS_TOKEN_REFRESH_INTERVAL_MS = 1000 * 60 * 10

const LINE_MESSAGE_TYPE = "text"

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
  const logPrefix = "[API: POST /api/notification]"

  try {
    const { teams, standings, games } = await fetchMlbData()

    const gameMessageDataList = await generateGameMessageDataList(
      teams,
      standings,
      games,
    )

    const result = await sendPushMessagesToUsers(gameMessageDataList)

    console.log(
      logPrefix,
      `Total: ${result.total}`,
      `Success: ${result.success}`,
      `Error: ${result.error}`,
      `Skip: ${result.skip}`,
    )

    return NextResponse.json({ message: "OK" })
  } catch (error) {
    console.error(logPrefix, "Error:", error)

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
  const [teams, standings, games] = await Promise.all([
    fetchTeamsApi(),
    fetchStandingsApi(),
    fetchGamesByDateApi(new Date()),
  ])

  const sortedGames = sortGamesByStartTime(games)

  return { teams, standings, games: sortedGames }
}

/**
 * 試合データを開始時間でソートする
 */
function sortGamesByStartTime(games: Game[]): Game[] {
  return games.sort((a, b) => {
    const aStartTime = new Date(a.gameDate).getTime()
    const bStartTime = new Date(b.gameDate).getTime()

    return aStartTime - bStartTime
  })
}

/**
 * 試合データを通知メッセージのデータに変換する
 */
async function generateGameMessageDataList(
  teams: Team[],
  standings: Standing[],
  games: Game[],
): Promise<GameMessageData[]> {
  // MEMO: パフォーマンス向上のため、マップに変換しておく
  const teamsMap = new Map<number, Team>(teams.map((team) => [team.id, team]))
  const standingsMap = new Map<number, Standing>(
    standings.map((standing) => [standing.teamId, standing]),
  )

  const dateTimeFormatter = new Intl.DateTimeFormat(
    GAME_START_TIME_FORMAT_LOCALE,
    GAME_START_TIME_FORMAT_OPTIONS,
  )

  const gameMessageDataList: GameMessageData[] = []

  for (const game of games) {
    const startTimeJST = dateTimeFormatter.format(new Date(game.gameDate))

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

    gameMessageDataList.push({
      gameMessage,
      home: {
        teamId: homeTeam.id,
        probablePitcherId: homeTeamPitcher?.id,
        isInPlayoffSpot: homeTeamStanding?.isInPlayoffSpot ?? false,
      },
      away: {
        teamId: awayTeam.id,
        probablePitcherId: awayTeamPitcher?.id,
        isInPlayoffSpot: awayTeamStanding?.isInPlayoffSpot ?? false,
      },
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
): Promise<{
  total: number
  success: number
  error: number
  skip: number
}> {
  const channelAccessTokenState: ChannelAccessTokenState = {
    token: "",
    issuedAt: 0,
  }

  const result = {
    total: 0,
    success: 0,
    error: 0,
    skip: 0,
  }

  for await (const users of iterateAllUsersByChunkWithRelations(CHUNK_SIZE, {
    players: true,
    teams: true,
  })) {
    // チャネルアクセストークンを発行する
    const { token, issuedAt } = await issueChannelAccessTokenIfNeeded(
      channelAccessTokenState,
    )
    channelAccessTokenState.token = token
    channelAccessTokenState.issuedAt = issuedAt

    const tasks: (() => Promise<void>)[] = users.map((user) => async () => {
      try {
        // ユーザーへのメッセージを生成する
        const registeredTeamIds = user.teams?.map((team) => team.teamId) ?? []
        const registeredPlayerIds =
          user.players?.map((player) => player.playerId) ?? []
        const messageObjects = buildMessageObjectsForUser(
          gameMessageDataList,
          registeredTeamIds,
          registeredPlayerIds,
        )
        if (messageObjects.length === 0) {
          result.skip++
          return
        }

        // メッセージを送信する
        await sendWithRetry({
          channelAccessToken: channelAccessTokenState.token,
          to: user.lineId,
          messages: messageObjects,
        })

        result.success++
      } catch (error) {
        console.error(
          `Failed to send LINE message: (userId: ${user.id})`,
          error,
        )

        result.error++
      } finally {
        result.total++
      }
    })

    await runWithConcurrency<void>(tasks, CONCURRENCY)
  }

  return result
}

/**
 * ユーザーごとに通知対象の試合を選定して、通知メッセージを生成する
 */
function buildMessageObjectsForUser(
  gameMessageDataList: GameMessageData[],
  registeredTeamIds: number[],
  registeredPlayerIds: number[],
): { type: string; text: string }[] {
  const dataLength = gameMessageDataList.length

  const { messageObjects } = gameMessageDataList.reduce(
    (acc, gameMessageData, index) => {
      const shouldNotify = shouldNotifyGameToUser(
        gameMessageData,
        registeredTeamIds,
        registeredPlayerIds,
      )

      if (shouldNotify) {
        acc.currentMessageArray.push(gameMessageData.gameMessage)
      }

      // 1メッセージあたりの試合数制限に達したか
      const isGameCountLimitReached =
        acc.currentMessageArray.length >= GAME_COUNT_PER_MESSAGE
      // 最後のデータかつメッセージ配列が存在するか
      const isLastAndExistsMessageArray =
        index === dataLength - 1 && acc.currentMessageArray.length > 0

      if (isGameCountLimitReached || isLastAndExistsMessageArray) {
        const joinedMessage = acc.currentMessageArray.join("\n\n")
        acc.messageObjects.push({
          type: LINE_MESSAGE_TYPE,
          text: joinedMessage,
        })
        acc.currentMessageArray = []
      }

      return acc
    },
    {
      messageObjects: [] as { type: string; text: string }[],
      currentMessageArray: [] as string[],
    },
  )

  return messageObjects
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
 * 必要に応じてチャネルアクセストークンを発行する
 * - 初回発行
 * - 発行されてから再発行間隔時間を経過している
 */
async function issueChannelAccessTokenIfNeeded({
  token = "",
  issuedAt = 0,
}: Partial<ChannelAccessTokenState>): Promise<ChannelAccessTokenState> {
  const now = Date.now()

  const isInitial = token === "" || issuedAt === 0

  const shouldRefreshToken = () =>
    !isInitial && now - issuedAt > CHANNEL_ACCESS_TOKEN_REFRESH_INTERVAL_MS

  if (isInitial || shouldRefreshToken()) {
    const res = await issueLineMessagingApiStatelessChannelAccessTokenApi()

    return {
      token: res.access_token,
      issuedAt: now,
    }
  }

  return {
    token,
    issuedAt,
  }
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

  const run = async (attemptCount: number): Promise<void> => {
    try {
      await sendLinePushMessageApi(channelAccessToken, retryKey, to, messages)

      return
    } catch (error) {
      const isRetryTargetError =
        error instanceof CustomError &&
        RETRYABLE_ERROR_CODES.includes(error.code)

      if (!isRetryTargetError || attemptCount > MAX_RETRY_COUNT) {
        throw error
      }

      const jitter = Math.floor(Math.random() * BASE_JITTER_MS)
      const waitMs = BASE_RETRY_INTERVAL_MS * 2 ** (attemptCount - 1) + jitter
      await new Promise((resolve) => setTimeout(resolve, waitMs))

      await run(attemptCount + 1)
    }
  }

  await run(1)
}
