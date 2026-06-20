import type { UserRepository } from "../domain/user.repository";

export const prismaUserRepository: UserRepository = {
  findMany() {
    throw new Error("Implement prismaUserRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaUserRepository.create after adding the Prisma model.");
  },
};
