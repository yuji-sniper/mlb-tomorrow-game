import type { ERROR_CODE } from "@/shared/constants/error"

export type ActionResponse<T> = ActionSuccessResponse<T> | ActionErrorResponse

export type ActionSuccessResponse<T> = {
  ok: true
  data: T
}

export type ActionErrorResponse = {
  ok: false
  error: {
    code: keyof typeof ERROR_CODE
    message: string
    data?: Record<string, unknown>
  }
}
