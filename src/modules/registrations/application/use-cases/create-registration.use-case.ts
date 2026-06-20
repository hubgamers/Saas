import type { RegistrationRepository } from "../../domain/registration.repository";
import type { RegistrationStatus } from "../../domain/registration.entity";
import { assertCanCreateRegistration } from "../../domain/registration.rules";
import { toRegistrationDto } from "../dtos/registration.dto";

type Input = {
  tournamentId: string; // @relation(Tournament)
  teamId: string; // @relation(Team)
  registeredById: string; // @relation(User)
  status: RegistrationStatus;
  registrationRepository: RegistrationRepository;
};

export async function createRegistrationUseCase(input: Input) {
  assertCanCreateRegistration();

  const registration = await input.registrationRepository.create({
    tournamentId: input.tournamentId,
    teamId: input.teamId,
    registeredById: input.registeredById,
    status: input.status,
  });

  return toRegistrationDto(registration);
}
