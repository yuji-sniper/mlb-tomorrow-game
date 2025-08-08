export const BADGE_TYPE = {
  ADD: "add",
  REMOVE: "remove",
  CHECK: "check",
} as const

export type BadgeType = (typeof BADGE_TYPE)[keyof typeof BADGE_TYPE]
