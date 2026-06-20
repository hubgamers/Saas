import type { NewTournamentPhase, TournamentPhase } from "./tournament-phase.entity";

export interface TournamentPhaseRepository {
  findMany(): Promise<TournamentPhase[]>;
  create(data: NewTournamentPhase): Promise<TournamentPhase>;
}
