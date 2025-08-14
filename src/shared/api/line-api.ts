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

export async function verifyLineTokenApi(
  lineIdToken: string,
): Promise<VerifyLineTokenApiSuccessResponse> {
  const clientId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID
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
    const lineVerifyData = data as VerifyLineTokenApiErrorResponse
    throw new CustomError(
      ERROR_CODE.UNAUTHORIZED,
      `Failed to verify LINE ID token: ${lineVerifyData.error_description}`,
    )
  }

  return data as VerifyLineTokenApiSuccessResponse
}
