import type { PlayerRepository } from "../domain/player.repository";

export const prismaPlayerRepository: PlayerRepository = {
  findMany() {
    throw new Error("Implement prismaPlayerRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaPlayerRepository.create after adding the Prisma model.");
  },
};
