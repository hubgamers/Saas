import type { NewOrganization, Organization } from "./organization.entity";

export interface OrganizationRepository {
  findMany(): Promise<Organization[]>;
  create(data: NewOrganization): Promise<Organization>;
}
