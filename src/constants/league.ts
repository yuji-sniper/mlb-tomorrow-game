export const LEAGUE = {
  american: {
    id: 103,
    name: "ア・リーグ",
    divisions: {
      east: {
        id: 201,
        name: "東地区",
      },
      central: {
        id: 202,
        name: "中地区",
      },
      west: {
        id: 200,
        name: "西地区",
      },
    }
  },
  national: {
    id: 104,
    name: "ナ・リーグ",
    divisions: {
      east: {
        id: 204,
        name: "東地区",
      },
      central: {
        id: 205,
        name: "中地区",
      },
      west: {
        id: 203,
        name: "西地区",
      },
    }
  }
}

export const LEAGUE_DISPLAY_ORDER = {
  [LEAGUE.american.id.toString()]: [
    LEAGUE.american.divisions.east.id.toString(),
    LEAGUE.american.divisions.central.id.toString(),
    LEAGUE.american.divisions.west.id.toString(),
  ],
  [LEAGUE.national.id.toString()]: [
    LEAGUE.national.divisions.east.id.toString(),
    LEAGUE.national.divisions.central.id.toString(),
    LEAGUE.national.divisions.west.id.toString(),
  ],
};
