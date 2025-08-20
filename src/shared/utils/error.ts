import type { ErrorCode } from "@/shared/types/error"

export class CustomError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public data?: Record<string, unknown>,
  ) {
    super(message)
  }
}
