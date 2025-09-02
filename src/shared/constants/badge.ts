export const BADGE_TYPE = {
  CHECK: "check",
} as const

export type BadgeType = (typeof BADGE_TYPE)[keyof typeof BADGE_TYPE]
