import { listEventTournamentsUseCase } from "../application/use-cases/list-event-tournaments.use-case";
import { prismaEventTournamentRepository } from "../infrastructure/prisma-event-tournament.repository";

export async function getEventTournaments() {
  return listEventTournamentsUseCase({
    eventTournamentRepository: prismaEventTournamentRepository,
  });
}
