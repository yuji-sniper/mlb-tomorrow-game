import { ERROR_CODE } from "@/shared/constants/error"
import { CustomError } from "@/shared/utils/error"

/**
 * 情報ログを出力
 */
export function logInfo(prefix: string, ...messages: string[]) {
  console.log(`[${prefix}]`, ...messages)
}

/**
 * エラーログを出力
 */
export function logError(prefix: string, error: unknown) {
  const outputLog = (shouldLogAsError: boolean = true) => {
    const logMethod = shouldLogAsError ? console.error : console.log
    logMethod(`[${prefix}]`, error)
  }

  if (error instanceof CustomError) {
    outputLog(error.code === ERROR_CODE.INTERNAL_SERVER_ERROR)
    return
  }

  outputLog()
}
