import type { OrganizationRepository } from "../domain/organization.repository";

export const prismaOrganizationRepository: OrganizationRepository = {
  findMany() {
    throw new Error("Implement prismaOrganizationRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaOrganizationRepository.create after adding the Prisma model.");
  },
};
