import { listOrganizationMembersUseCase } from "../application/use-cases/list-organization-members.use-case";
import { prismaOrganizationMemberRepository } from "../infrastructure/prisma-organization-member.repository";

export async function getOrganizationMembers() {
  return listOrganizationMembersUseCase({
    organizationMemberRepository: prismaOrganizationMemberRepository,
  });
}
