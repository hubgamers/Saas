import type { GameRepository } from "../domain/game.repository";

export const prismaGameRepository: GameRepository = {
  findMany() {
    throw new Error("Implement prismaGameRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaGameRepository.create after adding the Prisma model.");
  },
};
