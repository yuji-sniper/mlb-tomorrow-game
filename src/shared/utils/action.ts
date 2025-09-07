import { ERROR_CODE } from "@/shared/constants/error"
import type {
  ActionErrorResponse,
  ActionSuccessResponse,
} from "@/shared/types/action"
import { CustomError } from "@/shared/utils/error"

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
 * @param defaultMessage
 * @param error
 * @returns
 */
export function generateActionErrorResponse(
  defaultMessage: string,
  error: unknown,
): ActionErrorResponse {
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
    return createErrorResponse(error.code, error.message, error.data)
  }

  // Errorの場合
  if (error instanceof Error) {
    return createErrorResponse(
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      error.message || defaultMessage,
    )
  }

  // その他のエラーの場合
  return createErrorResponse(ERROR_CODE.INTERNAL_SERVER_ERROR, defaultMessage)
}
