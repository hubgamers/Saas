import type { NewOrganization, Organization } from "./organization.entity";

export interface OrganizationRepository {
  findMany(): Promise<Organization[]>;
  findManyAccessibleByUserId(userId: string): Promise<Organization[]>;
  findAccessibleByIdForUserId(id: string, userId: string): Promise<Organization | null>;
  create(data: NewOrganization): Promise<Organization>;
}
