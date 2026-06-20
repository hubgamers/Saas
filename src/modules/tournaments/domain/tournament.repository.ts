import type { NewTournament, Tournament } from "./tournament.entity";

export interface TournamentRepository {
  findMany(): Promise<Tournament[]>;
  create(data: NewTournament): Promise<Tournament>;
}
