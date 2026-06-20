import type { MatchParticipantRepository } from "../domain/match-participant.repository";

export const prismaMatchParticipantRepository: MatchParticipantRepository = {
  findMany() {
    throw new Error("Implement prismaMatchParticipantRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaMatchParticipantRepository.create after adding the Prisma model.");
  },
};
