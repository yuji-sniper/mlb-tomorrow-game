import type { ERROR_CODE } from "@/shared/constants/error"

export class CustomError extends Error {
  constructor(
    public code: keyof typeof ERROR_CODE,
    message?: string,
    public data?: Record<string, unknown>,
  ) {
    super(message)
  }
}
