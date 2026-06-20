import type { BroadcastRepository } from "../domain/broadcast.repository";

export const prismaBroadcastRepository: BroadcastRepository = {
  findMany() {
    throw new Error("Implement prismaBroadcastRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaBroadcastRepository.create after adding the Prisma model.");
  },
};
