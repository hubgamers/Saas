import type { OrganizationRepository } from "../../domain/organization.repository";
import { toOrganizationDto } from "../dtos/organization.dto";

type Input = {
  organizationId: string;
  userId: string;
  organizationRepository: OrganizationRepository;
};

export async function getAccessibleOrganizationUseCase(input: Input) {
  const organization = await input.organizationRepository.findAccessibleByIdForUserId(
    input.organizationId,
    input.userId,
  );

  return organization ? toOrganizationDto(organization) : null;
}

