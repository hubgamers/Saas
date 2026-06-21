import type { UserRepository } from "../domain/user.repository";
import { prisma } from "@/infrastructure/database/prisma";
import type { User } from "../domain/user.entity";

function toDomainUser(user: {
  id: string;
  username: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    ...user,
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export const prismaUserRepository: UserRepository = {
  async findMany() {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map(toDomainUser);
  },

  async create(data) {
    const user = await prisma.user.create({
      data,
    });

    return toDomainUser(user);
  },

  async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user ? toDomainUser(user) : null;
  },

  async validateUserCredentials(email, password) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || user.passwordHash !== password) {
      return null;
    }

    return toDomainUser(user);
  },
};
