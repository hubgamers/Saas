export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { Organization } from "../../domain/organization.entity";

export type OrganizationDto = {
  id: string;
  name: string;
  ownerId: string;
  owner?: RelationReferenceDto;
  slug: string;
  logoUrl?: string;
  createdAt: string;
};

export function toOrganizationDto(organization: Organization): OrganizationDto {
  return {
    id: organization.id,
    name: organization.name,
    ownerId: organization.ownerId,
    owner: organization.owner,
    slug: organization.slug,
    logoUrl: organization.logoUrl,
    createdAt: organization.createdAt.toISOString(),
  };
}
