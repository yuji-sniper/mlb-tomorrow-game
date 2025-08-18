import { ERROR_CODE } from "@/shared/constants/error"
import { CustomError } from "@/shared/errors/error"

type VerifyLineTokenApiSuccessResponse = {
  sub: string
  aud: string
  name: string
  picture: string
  email: string
}

type VerifyLineTokenApiErrorResponse = {
  error: string
  error_description: string
}

/**
 * LINE IDトークンを検証する
 */
export async function verifyLineTokenApi(
  lineIdToken: string,
): Promise<VerifyLineTokenApiSuccessResponse> {
  const clientId = process.env.LINE_LOGIN_CHANNEL_ID
  if (!clientId) {
    throw new CustomError(
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      "LINE_CHANNEL_ID is not set in environment variables",
    )
  }

  const params = new URLSearchParams()
  params.append("id_token", lineIdToken)
  params.append("client_id", clientId)

  const res = await fetch(
    `https://api.line.me/oauth2/v2.1/verify?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  )

  const data = await res.json()

  if (!res.ok) {
    const errorData = data as VerifyLineTokenApiErrorResponse
    throw new CustomError(
      ERROR_CODE.UNAUTHORIZED,
      `Failed to verify LINE ID token: ${errorData.error_description}`,
    )
  }

  return data as VerifyLineTokenApiSuccessResponse
}

type LineStatelessChannelAccessTokenApiSuccessResponse = {
  token_type: string
  access_token: string
  expires_in: number
}

type LineStatelessChannelAccessTokenApiErrorResponse = {
  error: string
  error_description: string
}

/**
 * LINE Messaging APIのステートレスチャネルアクセストークンを発行する
 */
export async function issueLineMessagingApiStatelessChannelAccessTokenApi() {
  const clientId = process.env.LINE_MESSAGING_API_CHANNEL_ID
  if (!clientId) {
    throw new CustomError(
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      "LINE_CHANNEL_ID is not set in environment variables",
    )
  }

  const clientSecret = process.env.LINE_MESSAGING_API_CHANNEL_SECRET
  if (!clientSecret) {
    throw new CustomError(
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      "LINE_CHANNEL_SECRET is not set in environment variables",
    )
  }

  const params = new URLSearchParams()
  params.append("grant_type", "client_credentials")
  params.append("client_id", clientId)
  params.append("client_secret", clientSecret)

  const res = await fetch(
    `https://api.line.me/oauth2/v3/token?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  )

  const data = await res.json()

  if (!res.ok) {
    const errorData = data as LineStatelessChannelAccessTokenApiErrorResponse
    throw new CustomError(
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      `Failed to issue LINE stateless channel access token: ${errorData.error_description}`,
    )
  }

  return data as LineStatelessChannelAccessTokenApiSuccessResponse
}

type LinePushMessageApiSuccessResponse = {
  sentMessages: {
    id: string
    quoteToken: string
  }[]
}

type LinePushMessageApiErrorResponse = {
  message: string
}

/**
 * LINEのプッシュメッセージを送信する
 */
export async function sendLinePushMessageApi(
  channelAccessToken: string,
  retryKey: string,
  to: string,
  messages: {
    type: string
    text: string
  }[],
): Promise<LinePushMessageApiSuccessResponse> {
  const res = await fetch(`https://api.line.me/v2/bot/message/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
      "X-Line-Retry-Key": retryKey,
    },
    body: JSON.stringify({
      to,
      messages,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const errorData = data as LinePushMessageApiErrorResponse
    const errorStatusCodeMap: Record<number, keyof typeof ERROR_CODE> = {
      400: ERROR_CODE.BAD_REQUEST,
      409: ERROR_CODE.CONFLICT,
      429: ERROR_CODE.TOO_MANY_REQUESTS,
    }
    const errorMessage = `Failed to send LINE push message: ${errorData.message}`

    const errorCode =
      errorStatusCodeMap[res.status as keyof typeof errorStatusCodeMap] ??
      ERROR_CODE.INTERNAL_SERVER_ERROR

    throw new CustomError(errorCode, errorMessage)
  }

  return data as LinePushMessageApiSuccessResponse
}
