import type { EventRepository } from "../domain/event.repository";

export const prismaEventRepository: EventRepository = {
  findMany() {
    throw new Error("Implement prismaEventRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaEventRepository.create after adding the Prisma model.");
  },
};
