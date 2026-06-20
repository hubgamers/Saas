import { listOrganizationsUseCase } from "../application/use-cases/list-organizations.use-case";
import { prismaOrganizationRepository } from "../infrastructure/prisma-organization.repository";

export async function getOrganizations() {
  return listOrganizationsUseCase({
    organizationRepository: prismaOrganizationRepository,
  });
}
