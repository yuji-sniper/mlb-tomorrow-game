import { Division } from "@/types/division";

export type League = {
  name: string;
  divisions: {
    [divisionId: string]: Division
  };
}

export type Leagues = {
  [leagueId: string]: League;
}
