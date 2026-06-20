import type { MatchRepository } from "../domain/match.repository";

export const prismaMatchRepository: MatchRepository = {
  findMany() {
    throw new Error("Implement prismaMatchRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaMatchRepository.create after adding the Prisma model.");
  },
};
