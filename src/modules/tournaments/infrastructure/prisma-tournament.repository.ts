import type { TournamentRepository } from "../domain/tournament.repository";

export const prismaTournamentRepository: TournamentRepository = {
  findMany() {
    throw new Error("Implement prismaTournamentRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaTournamentRepository.create after adding the Prisma model.");
  },
};
