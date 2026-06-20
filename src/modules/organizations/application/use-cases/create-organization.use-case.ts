import type { OrganizationRepository } from "../../domain/organization.repository";
import { assertCanCreateOrganization } from "../../domain/organization.rules";
import { toOrganizationDto } from "../dtos/organization.dto";

type Input = {
  name: string;
  ownerId: string; // @relation(User)
  slug: string;
  logoUrl?: string;
  organizationRepository: OrganizationRepository;
};

export async function createOrganizationUseCase(input: Input) {
  assertCanCreateOrganization();

  const organization = await input.organizationRepository.create({
    name: input.name,
    ownerId: input.ownerId,
    slug: input.slug,
    logoUrl: input.logoUrl,
  });

  return toOrganizationDto(organization);
}
