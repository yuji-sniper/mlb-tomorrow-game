import { ERROR_CODE } from "@/shared/constants/error"
import { CustomError } from "@/shared/errors/error"
import type {
  ActionErrorResponse,
  ActionSuccessResponse,
} from "@/shared/types/action"

/**
 * 成功レスポンスを生成
 * @param data
 * @returns
 */
export function generateActionSuccessResponse<T>(
  data: T,
): ActionSuccessResponse<T> {
  return {
    ok: true,
    data,
  }
}

/**
 * エラーレスポンスを生成
 * @param logPrefix
 * @param defaultMessage
 * @param error
 * @returns
 */
export function generateActionErrorResponse(
  logPrefix: string,
  defaultMessage: string,
  error: unknown,
): ActionErrorResponse {
  const logError = (shouldLogAsError: boolean = true) => {
    const logMethod = shouldLogAsError ? console.error : console.log
    logMethod(`[${logPrefix}]`, error)
  }

  const createErrorResponse = (
    code: keyof typeof ERROR_CODE,
    message: string,
    data?: Record<string, unknown>,
  ): ActionErrorResponse => ({
    ok: false,
    error: { code, message, ...(data && { data }) },
  })

  // CustomErrorの場合
  if (error instanceof CustomError) {
    const shouldLogAsError = error.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    logError(shouldLogAsError)

    return createErrorResponse(error.code, error.message, error.data)
  }

  // Errorの場合
  if (error instanceof Error) {
    logError()
    return createErrorResponse(
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      error.message || defaultMessage,
    )
  }

  // その他のエラーの場合
  logError()
  return createErrorResponse(ERROR_CODE.INTERNAL_SERVER_ERROR, defaultMessage)
}
