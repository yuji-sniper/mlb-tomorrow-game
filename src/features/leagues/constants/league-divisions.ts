import { LEAGUE_ID } from "@/shared/constants/league";
import { DIVISION_ID } from "@/shared/constants/division";

export const LEAGUE_DIVISIONS = {
  [LEAGUE_ID.AMERICAN]: [
    DIVISION_ID.AMERICAN_EAST,
    DIVISION_ID.AMERICAN_CENTRAL,
    DIVISION_ID.AMERICAN_WEST,
  ],
  [LEAGUE_ID.NATIONAL]: [
    DIVISION_ID.NATIONAL_EAST,
    DIVISION_ID.NATIONAL_CENTRAL,
    DIVISION_ID.NATIONAL_WEST,
  ],
} as const;
