export const LEAGUE_ID = {
  AMERICAN: 103,
  NATIONAL: 104,
} as const

export const LEAGUE_NAME_JP = {
  [LEAGUE_ID.AMERICAN]: "アメリカン・リーグ",
  [LEAGUE_ID.NATIONAL]: "ナショナル・リーグ",
} as const
