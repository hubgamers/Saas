import type { OrganizationRepository } from "../../domain/organization.repository";
import { toOrganizationDto } from "../dtos/organization.dto";

type Input = {
  userId: string;
  organizationRepository: OrganizationRepository;
};

export async function listAccessibleOrganizationsUseCase(input: Input) {
  const organizations = await input.organizationRepository.findManyAccessibleByUserId(input.userId);

  return organizations.map(toOrganizationDto);
}

