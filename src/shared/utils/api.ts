import { ServerError } from '@/shared/errors/error';
import { ApiErrorResponse, ApiSuccessResponse } from '@/shared/types/api';
import { ERROR_CODE } from '@/shared/constants/error';

/**
 * 成功レスポンスを生成
 * @param data
 * @returns
 */
export function generateApiSuccessResponse<T>(
  data: T
): ApiSuccessResponse<T> {
  return {
    ok: true,
    data,
  };
}

/**
 * エラーレスポンスを生成
 * @param logPrefix
 * @param defaultMessage
 * @param error
 * @returns
 */
export function generateApiErrorResponse(
  logPrefix: string,
  defaultMessage: string,
  error: unknown,
): ApiErrorResponse {
  if (error instanceof ServerError) {
    if (error.code === ERROR_CODE.INTERNAL_SERVER_ERROR) {
      console.error(`[${logPrefix}]`, error);
    }
    return {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        data: error.data,
      },
    };
  } else if (error instanceof Error) {
    console.error(`[${logPrefix}]`, error);
    return {
      ok: false,
      error: {
        code: ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: error.message || defaultMessage,
      },
    };
  } else {
    console.error(`[${logPrefix}]`, error);
    return {
      ok: false,
      error: {
        code: ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: defaultMessage,
      },
    };
  }
}

