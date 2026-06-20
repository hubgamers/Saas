import type { NewMatch, Match } from "./match.entity";

export interface MatchRepository {
  findMany(): Promise<Match[]>;
  create(data: NewMatch): Promise<Match>;
}
