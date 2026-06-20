import type { RegistrationRepository } from "../domain/registration.repository";

export const prismaRegistrationRepository: RegistrationRepository = {
  findMany() {
    throw new Error("Implement prismaRegistrationRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaRegistrationRepository.create after adding the Prisma model.");
  },
};
