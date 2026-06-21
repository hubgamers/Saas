import { cookies } from "next/headers";
import { listOrganizationsUseCase } from "../application/use-cases/list-organizations.use-case";
import { listAccessibleOrganizationsUseCase } from "../application/use-cases/list-accessible-organizations.use-case";
import { prismaOrganizationRepository } from "../infrastructure/prisma-organization.repository";
import { ACTIVE_ORGANIZATION_COOKIE } from "./constants";
import { getCurrentPrismaUser } from "./current-user";

export async function getOrganizations() {
  return listOrganizationsUseCase({
    organizationRepository: prismaOrganizationRepository,
  });
}

export async function getOrganizationSwitcherState() {
  const user = await getCurrentPrismaUser();

  if (!user) {
    return {
      organizations: [],
      activeOrganization: null,
    };
  }

  const organizations = await listAccessibleOrganizationsUseCase({
    userId: user.id,
    organizationRepository: prismaOrganizationRepository,
  });
  const cookieStore = await cookies();
  const activeOrganizationId = cookieStore.get(ACTIVE_ORGANIZATION_COOKIE)?.value;
  const activeOrganization =
    organizations.find((organization) => organization.id === activeOrganizationId) ??
    organizations[0] ??
    null;

  return {
    organizations,
    activeOrganization,
  };
}

export async function getActiveOrganizationForCurrentUser() {
  const { activeOrganization } = await getOrganizationSwitcherState();

  return activeOrganization;
}
