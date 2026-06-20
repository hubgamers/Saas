export type RelationReference = {
  id: string;
  label?: string;
};

export const OrganizationMemberRoleValues = ["OWNER", "ADMIN", "STAFF", "CASTER", "REFEREE", "VIEWER"] as const;
export type OrganizationMemberRole = (typeof OrganizationMemberRoleValues)[number];

export type OrganizationMember = {
  id: string;
  organizationId: string;
  organization?: RelationReference;
  userId: string;
  user?: RelationReference;
  role: OrganizationMemberRole;
  createdAt: Date;
  updatedAt: Date;
};

export type NewOrganizationMember = {
  organizationId: string; // @relation(Organization)
  userId: string; // @relation(User)
  role: OrganizationMemberRole;
};
