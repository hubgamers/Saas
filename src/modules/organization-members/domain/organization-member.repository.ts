import type { NewOrganizationMember, OrganizationMember } from "./organization-member.entity";

export interface OrganizationMemberRepository {
  findMany(): Promise<OrganizationMember[]>;
  create(data: NewOrganizationMember): Promise<OrganizationMember>;
}
