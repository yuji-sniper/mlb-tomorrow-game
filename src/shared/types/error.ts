import type { ERROR_CODE } from "@/shared/constants/error"

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE]
