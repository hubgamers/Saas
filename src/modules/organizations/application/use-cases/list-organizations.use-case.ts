import type { OrganizationRepository } from "../../domain/organization.repository";
import { toOrganizationDto } from "../dtos/organization.dto";

type Input = {
  organizationRepository: OrganizationRepository;
};

export async function listOrganizationsUseCase(input: Input) {
  const organizations = await input.organizationRepository.findMany();

  return organizations.map(toOrganizationDto);
}
