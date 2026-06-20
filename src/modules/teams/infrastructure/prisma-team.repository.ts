import type { TeamRepository } from "../domain/team.repository";

export const prismaTeamRepository: TeamRepository = {
  findMany() {
    throw new Error("Implement prismaTeamRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaTeamRepository.create after adding the Prisma model.");
  },
};
