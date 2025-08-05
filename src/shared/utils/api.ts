import { CustomError } from '@/shared/errors/error';
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
  const logError = (shouldLogAsError: boolean = true) => {
    const logMethod = shouldLogAsError ? console.error : console.log;
    logMethod(`[${logPrefix}]`, error);
  };

  const createErrorResponse = (
    code: keyof typeof ERROR_CODE,
    message: string,
    data?: Record<string, unknown>,
  ): ApiErrorResponse => ({
    ok: false,
    error: { code, message, ...(data && { data }) },
  });

  // CustomErrorの場合
  if (error instanceof CustomError) {
    const shouldLogAsError = error.code === ERROR_CODE.INTERNAL_SERVER_ERROR;
    logError(shouldLogAsError);
    
    return createErrorResponse(error.code, error.message, error.data);
  }

  // Errorの場合
  if (error instanceof Error) {
    logError();
    return createErrorResponse(
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      error.message || defaultMessage
    );
  }

  // その他のエラーの場合
  logError();
  return createErrorResponse(ERROR_CODE.INTERNAL_SERVER_ERROR, defaultMessage);
}

