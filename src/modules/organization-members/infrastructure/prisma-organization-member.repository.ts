import type { OrganizationMemberRepository } from "../domain/organization-member.repository";

export const prismaOrganizationMemberRepository: OrganizationMemberRepository = {
  findMany() {
    throw new Error("Implement prismaOrganizationMemberRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaOrganizationMemberRepository.create after adding the Prisma model.");
  },
};
