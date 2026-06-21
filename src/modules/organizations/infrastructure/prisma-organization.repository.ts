import type { OrganizationRepository } from "../domain/organization.repository";
import { prisma } from "@/infrastructure/database/prisma";
import type { Organization } from "../domain/organization.entity";

type OrganizationWithOwner = {
  id: string;
  name: string;
  ownerId: string;
  slug: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    username: string;
    email: string;
  };
};

const organizationInclude = {
  owner: {
    select: {
      id: true,
      username: true,
      email: true,
    },
  },
} as const;

function toDomainOrganization(organization: OrganizationWithOwner): Organization {
  return {
    ...organization,
    logoUrl: organization.logoUrl ?? undefined,
    owner: {
      id: organization.owner.id,
      label: organization.owner.username || organization.owner.email,
    },
  };
}

export const prismaOrganizationRepository: OrganizationRepository = {
  async findMany() {
    const organizations = await prisma.organization.findMany({
      include: organizationInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return organizations.map(toDomainOrganization);
  },

  async findManyAccessibleByUserId(userId) {
    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          {
            ownerId: userId,
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: organizationInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return organizations.map(toDomainOrganization);
  },

  async findAccessibleByIdForUserId(id, userId) {
    const organization = await prisma.organization.findFirst({
      where: {
        id,
        OR: [
          {
            ownerId: userId,
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: organizationInclude,
    });

    return organization ? toDomainOrganization(organization) : null;
  },

  async create(data) {
    const organization = await prisma.organization.create({
      data,
      include: organizationInclude,
    });

    return toDomainOrganization(organization);
  },
};
