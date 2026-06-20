import { listRegistrationsUseCase } from "../application/use-cases/list-registrations.use-case";
import { prismaRegistrationRepository } from "../infrastructure/prisma-registration.repository";

export async function getRegistrations() {
  return listRegistrationsUseCase({
    registrationRepository: prismaRegistrationRepository,
  });
}
