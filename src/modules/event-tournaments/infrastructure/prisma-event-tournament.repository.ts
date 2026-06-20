import type { EventTournamentRepository } from "../domain/event-tournament.repository";

export const prismaEventTournamentRepository: EventTournamentRepository = {
  findMany() {
    throw new Error("Implement prismaEventTournamentRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaEventTournamentRepository.create after adding the Prisma model.");
  },
};
