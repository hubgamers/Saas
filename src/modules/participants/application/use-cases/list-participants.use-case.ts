import type { ParticipantRepository } from "../../domain/participant.repository";
import { toParticipantDto } from "../dtos/participant.dto";

type Input = {
  participantRepository: ParticipantRepository;
};

export async function listParticipantsUseCase(input: Input) {
  const participants = await input.participantRepository.findMany();

  return participants.map(toParticipantDto);
}
