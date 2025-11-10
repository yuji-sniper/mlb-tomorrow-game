import { type NextRequest, NextResponse } from "next/server"
import { iterateAllUsersByChunkWithRelations } from "@/features/users/repositories/fetch-users-repository"
import { countUsers } from "@/features/users/repositories/find-user-repository"
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
import { ERROR_CODE, ERROR_CODE_TO_STATUS } from "@/shared/constants/error"
import type { ErrorCode } from "@/shared/types/error"
import type { Game } from "@/shared/types/game"
import type { Standing } from "@/shared/types/standing"
import type { Team } from "@/shared/types/team"
import { runWithConcurrency } from "@/shared/utils/concurrency"
import { CustomError } from "@/shared/utils/error"
import { getLastName } from "@/shared/utils/name"

type GameContentData = {
  startTimeJST: string
  home: {
    teamId: number
    teamName: string
    standingText: string
    pitcherLastName: string
    probablePitcherId?: number
    isTeamInPlayoffSpot: boolean
  }
  away: {
    teamId: number
    teamName: string
    standingText: string
    pitcherLastName: string
    probablePitcherId?: number
    isTeamInPlayoffSpot: boolean
  }
}

type ChannelAccessTokenState = {
  token: string
  issuedAt: number
}

type MessageObject = {
  type: string
  altText: string
  contents: object
}

const DATETIME_FORMAT_LOCALE = "ja-JP"

const GAME_DATE_FORMAT_OPTIONS = {
  month: "2-digit",
  day: "2-digit",
} as const

const GAME_START_TIME_FORMAT_OPTIONS = {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
} as const

const MAX_GAME_COUNT_PER_MESSAGE = 10

const CHUNK_SIZE = 200

// 送信処理の並列数
const CONCURRENCY = 10

// MEMO: LINE APIのチャネルアクセストークンの有効期限が15分なので、ゆとりを持って10分で再発行する
const CHANNEL_ACCESS_TOKEN_REFRESH_INTERVAL_MS = 1000 * 60 * 10

const LINE_MESSAGE_TYPE = "flex"

const MAX_RETRY_COUNT = 3

const BASE_JITTER_MS = 250

const BASE_RETRY_INTERVAL_MS = 1000

const RETRYABLE_ERROR_CODES: ErrorCode[] = [
  ERROR_CODE.TOO_MANY_REQUESTS,
  ERROR_CODE.INTERNAL_SERVER_ERROR,
]

/**
 * 通知を送信する
 * TODO: EventBridgeのAPI Destinationだと5秒でタイムアウトするから、Lambdaを経由させたい。
 */
export async function POST(request: NextRequest) {
  const logPrefix = "[API: POST /api/notification]"

  try {
    if (!authenticate(request)) {
      throw new CustomError(ERROR_CODE.UNAUTHORIZED)
    }

    const { teams, standings, games } = await fetchMlbData()

    if (games.length === 0) {
      // supabaseの無料プランは7日間アクセスがないとスリープするので、ユーザー数を取得クエリを実行してスリープを回避する
      const count = await countUsers()
      console.log(logPrefix, `Total users: ${count}`)

      return NextResponse.json({ message: "No games found" })
    }

    const gameContentDataList = await generateGameContentDataList(
      teams,
      standings,
      games,
    )

    const result = await sendPushMessagesToUsers(gameContentDataList)

    console.log(
      logPrefix,
      `Total:${result.total}`,
      `Success:${result.success}`,
      `Error:${result.error}`,
      `Skip:${result.skip}`,
    )

    return NextResponse.json({ message: "OK" })
  } catch (error) {
    console.error(logPrefix, "Error:", error)

    const errorCode = (error as CustomError)?.code

    switch (errorCode) {
      case ERROR_CODE.UNAUTHORIZED:
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: ERROR_CODE_TO_STATUS[ERROR_CODE.UNAUTHORIZED] },
        )
      default:
        return NextResponse.json(
          { message: "Internal Server Error" },
          { status: ERROR_CODE_TO_STATUS[ERROR_CODE.INTERNAL_SERVER_ERROR] },
        )
    }
  }
}

/**
 * APIキー認証
 */
function authenticate(request: NextRequest) {
  const requestApiKey = request.headers.get("x-api-key")

  return requestApiKey === process.env.API_KEY
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
 * 試合データを通知メッセージ用のデータに変換する
 */
async function generateGameContentDataList(
  teams: Team[],
  standings: Standing[],
  games: Game[],
): Promise<GameContentData[]> {
  // MEMO: パフォーマンス向上のため、マップに変換しておく
  const teamsMap = new Map<number, Team>(teams.map((team) => [team.id, team]))
  const standingsMap = new Map<number, Standing>(
    standings.map((standing) => [standing.teamId, standing]),
  )

  const dateTimeFormatter = new Intl.DateTimeFormat(
    DATETIME_FORMAT_LOCALE,
    GAME_START_TIME_FORMAT_OPTIONS,
  )

  const gameContentDataList: GameContentData[] = []

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

    gameContentDataList.push({
      startTimeJST,
      home: {
        teamId: homeTeam.id,
        teamName: homeTeam.teamName,
        standingText: homeTeamStandingText,
        pitcherLastName: homeTeamPitcherLastName,
        probablePitcherId: homeTeamPitcher?.id,
        isTeamInPlayoffSpot: homeTeamStanding?.isInPlayoffSpot ?? false,
      },
      away: {
        teamId: awayTeam.id,
        teamName: awayTeam.teamName,
        standingText: awayTeamStandingText,
        pitcherLastName: awayTeamPitcherLastName,
        probablePitcherId: awayTeamPitcher?.id,
        isTeamInPlayoffSpot: awayTeamStanding?.isInPlayoffSpot ?? false,
      },
    })
  }

  return gameContentDataList
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

  return standing.isWildCardLeader
    ? `(${divisionRankText} WC)`
    : `(${divisionRankText})`
}

/**
 * ユーザーごとに通知メッセージを送信する
 */
async function sendPushMessagesToUsers(
  gameContentDataList: GameContentData[],
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

  const date = new Date()
  date.setDate(date.getDate() + 1)
  const tomorrowDate = date.toLocaleDateString(
    DATETIME_FORMAT_LOCALE,
    GAME_DATE_FORMAT_OPTIONS,
  )

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
          tomorrowDate,
          gameContentDataList,
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
 * ユーザーごとに通知対象の試合を選定して、LINE API用のメッセージオブジェクトを生成する
 */
function buildMessageObjectsForUser(
  tomorrowDate: string,
  gameContentDataList: GameContentData[],
  registeredTeamIds: number[],
  registeredPlayerIds: number[],
): MessageObject[] {
  const dataLength = gameContentDataList.length

  const separator = {
    type: "separator",
    margin: "8px",
    color: "#1E293B",
  }

  const { messageObjects } = gameContentDataList.reduce(
    (acc, gameContentData, index) => {
      // 通知対象の試合か判定
      const shouldNotify = shouldNotifyGameToUser(
        gameContentData,
        registeredTeamIds,
        registeredPlayerIds,
      )
      // 通知対象の試合ならその試合要素を追加する
      if (shouldNotify) {
        const gameContentJson = buildGameContentJson(
          gameContentData.startTimeJST,
          gameContentData.home.teamName,
          gameContentData.home.standingText,
          gameContentData.home.pitcherLastName,
          gameContentData.away.teamName,
          gameContentData.away.standingText,
          gameContentData.away.pitcherLastName,
        )
        acc.currentGameContentArray.push(gameContentJson)
      }

      // 1メッセージあたりの試合数制限に達したか
      const isMaxGameCountReached =
        acc.currentGameContentArray.length >= MAX_GAME_COUNT_PER_MESSAGE

      // 最後のデータかつメッセージ配列が存在するかどうか
      const isLastAndExistsContentArray =
        index === dataLength - 1 && acc.currentGameContentArray.length > 0

      if (isMaxGameCountReached || isLastAndExistsContentArray) {
        // コンテンツを生成
        const gamesContents = acc.currentGameContentArray.flatMap(
          (gameContentJson, index) =>
            index === 0 ? [gameContentJson] : [separator, gameContentJson],
        )
        const fullContents = setGamesContentsToLayout(
          gamesContents,
          acc.messageObjects.length === 0 ? tomorrowDate : undefined,
        )

        acc.messageObjects.push({
          type: LINE_MESSAGE_TYPE,
          altText: `明日のMLB試合情報（${tomorrowDate}）`,
          contents: fullContents,
        })
        acc.currentGameContentArray = []
      }

      return acc
    },
    {
      messageObjects: [] as MessageObject[],
      currentGameContentArray: [] as object[],
    },
  )

  return messageObjects
}

/**
 * ユーザーの登録データと試合データをもとに、通知対象の試合かどうかを判定する
 */
function shouldNotifyGameToUser(
  gameContentData: GameContentData,
  registeredTeamIds: number[],
  registeredPlayerIds: number[],
): boolean {
  // [ホームチーム] 登録チームかどうか / 先発が登録選手かどうか / プレーオフ圏内かどうか
  const isHomeTeamRegistered = registeredTeamIds.includes(
    gameContentData.home.teamId,
  )
  const isHomeTeamPitcherRegistered = gameContentData.home.probablePitcherId
    ? registeredPlayerIds.includes(gameContentData.home.probablePitcherId)
    : false
  const isHomeTeamInPlayoffSpot = gameContentData.home.isTeamInPlayoffSpot

  // [アウェーチーム] 登録チームかどうか / 先発が登録選手かどうか / プレーオフ圏内かどうか
  const isAwayTeamRegistered = registeredTeamIds.includes(
    gameContentData.away.teamId,
  )
  const isAwayTeamPitcherRegistered = gameContentData.away.probablePitcherId
    ? registeredPlayerIds.includes(gameContentData.away.probablePitcherId)
    : false
  const isAwayTeamInPlayoffSpot = gameContentData.away.isTeamInPlayoffSpot

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
 * 試合コンテンツのJSONを生成する
 */
function buildGameContentJson(
  startTimeJST: string,
  homeTeamName: string,
  homeTeamStandingText: string,
  homeTeamPitcherLastName: string,
  awayTeamName: string,
  awayTeamStandingText: string,
  awayTeamPitcherLastName: string,
) {
  return {
    type: "box",
    layout: "vertical",
    paddingAll: "10px",
    backgroundColor: "#1E293B",
    cornerRadius: "10px",
    contents: [
      {
        type: "box",
        layout: "baseline",
        contents: [
          {
            type: "text",
            text: "⚾️",
            size: "sm",
            flex: 0,
          },
          {
            type: "text",
            text: `${startTimeJST}`,
            weight: "bold",
            size: "sm",
            color: "#E2E8F0",
            flex: 0,
            margin: "4px",
          },
          {
            type: "text",
            text: `${awayTeamName} @ ${homeTeamName}`,
            weight: "bold",
            size: "sm",
            color: "#E2E8F0",
            wrap: true,
            margin: "8px",
          },
        ],
      },
      {
        type: "box",
        layout: "horizontal",
        margin: "6px",
        contents: [
          {
            type: "text",
            text: `${awayTeamName}`,
            weight: "bold",
            size: "md",
            color: "#CBD5E1",
          },
          {
            type: "text",
            text: `${homeTeamName}`,
            weight: "bold",
            size: "md",
            color: "#CBD5E1",
            align: "end",
          },
        ],
      },
      {
        type: "box",
        layout: "horizontal",
        margin: "6px",
        contents: [
          {
            type: "text",
            text: `${awayTeamStandingText}`,
            size: "xs",
            color: "#CBD5E1",
          },
          {
            type: "text",
            text: `${homeTeamStandingText}`,
            size: "xs",
            color: "#CBD5E1",
            align: "end",
          },
        ],
      },
      {
        type: "box",
        layout: "horizontal",
        margin: "4px",
        contents: [
          {
            type: "text",
            text: `P: ${awayTeamPitcherLastName}`,
            size: "xs",
            color: "#94A3B8",
            wrap: true,
          },
          {
            type: "text",
            text: `P: ${homeTeamPitcherLastName}`,
            size: "xs",
            color: "#94A3B8",
            align: "end",
            wrap: true,
          },
        ],
      },
    ],
  }
}

/**
 * 試合コンテンツをレイアウト内に配置したJSONを生成する
 */
function setGamesContentsToLayout(
  gamesContents: object[],
  tomorrowDate?: string,
): object {
  const header = tomorrowDate
    ? {
        type: "box",
        layout: "horizontal",
        paddingAll: "14px",
        backgroundColor: "#111827",
        contents: [
          {
            type: "text",
            text: `明日の注目試合 (${tomorrowDate})`,
            weight: "bold",
            size: "md",
            color: "#F8FAFC",
          },
        ],
      }
    : undefined

  return {
    type: "bubble",
    size: "mega",
    header,
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "12px",
      backgroundColor: "#0A0A0A",
      spacing: "10px",
      contents: gamesContents,
    },
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
  messages: MessageObject[]
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
