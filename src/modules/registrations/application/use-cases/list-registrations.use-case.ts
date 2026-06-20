import type { RegistrationRepository } from "../../domain/registration.repository";
import { toRegistrationDto } from "../dtos/registration.dto";

type Input = {
  registrationRepository: RegistrationRepository;
};

export async function listRegistrationsUseCase(input: Input) {
  const registrations = await input.registrationRepository.findMany();

  return registrations.map(toRegistrationDto);
}
