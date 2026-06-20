import type { ParticipantRepository } from "../domain/participant.repository";

export const prismaParticipantRepository: ParticipantRepository = {
  findMany() {
    throw new Error("Implement prismaParticipantRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaParticipantRepository.create after adding the Prisma model.");
  },
};
