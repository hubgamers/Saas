import type { OrganizationMemberRepository } from "../../domain/organization-member.repository";
import { toOrganizationMemberDto } from "../dtos/organization-member.dto";

type Input = {
  organizationMemberRepository: OrganizationMemberRepository;
};

export async function listOrganizationMembersUseCase(input: Input) {
  const organizationMembers = await input.organizationMemberRepository.findMany();

  return organizationMembers.map(toOrganizationMemberDto);
}
