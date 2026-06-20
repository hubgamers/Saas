import { listTournamentPhaseUseCase } from "../application/use-cases/list-tournament-phase.use-case";
import { prismaTournamentPhaseRepository } from "../infrastructure/prisma-tournament-phase.repository";

export async function getTournamentPhase() {
  return listTournamentPhaseUseCase({
    tournamentPhaseRepository: prismaTournamentPhaseRepository,
  });
}
