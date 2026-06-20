export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { OrganizationMember, OrganizationMemberRole } from "../../domain/organization-member.entity";

export type OrganizationMemberDto = {
  id: string;
  organizationId: string;
  organization?: RelationReferenceDto;
  userId: string;
  user?: RelationReferenceDto;
  role: OrganizationMemberRole;
  createdAt: string;
};

export function toOrganizationMemberDto(organizationMember: OrganizationMember): OrganizationMemberDto {
  return {
    id: organizationMember.id,
    organizationId: organizationMember.organizationId,
    organization: organizationMember.organization,
    userId: organizationMember.userId,
    user: organizationMember.user,
    role: organizationMember.role,
    createdAt: organizationMember.createdAt.toISOString(),
  };
}
