import { listTournamentsUseCase } from "../application/use-cases/list-tournaments.use-case";
import { prismaTournamentRepository } from "../infrastructure/prisma-tournament.repository";

export async function getTournaments() {
  return listTournamentsUseCase({
    tournamentRepository: prismaTournamentRepository,
  });
}
