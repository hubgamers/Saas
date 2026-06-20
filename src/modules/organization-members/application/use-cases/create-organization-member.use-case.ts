import type { OrganizationMemberRepository } from "../../domain/organization-member.repository";
import type { OrganizationMemberRole } from "../../domain/organization-member.entity";
import { assertCanCreateOrganizationMember } from "../../domain/organization-member.rules";
import { toOrganizationMemberDto } from "../dtos/organization-member.dto";

type Input = {
  organizationId: string; // @relation(Organization)
  userId: string; // @relation(User)
  role: OrganizationMemberRole;
  organizationMemberRepository: OrganizationMemberRepository;
};

export async function createOrganizationMemberUseCase(input: Input) {
  assertCanCreateOrganizationMember();

  const organizationMember = await input.organizationMemberRepository.create({
    organizationId: input.organizationId,
    userId: input.userId,
    role: input.role,
  });

  return toOrganizationMemberDto(organizationMember);
}
