import type { ParticipantRepository } from "../../domain/participant.repository";
import type { ParticipantType, ParticipantStatus } from "../../domain/participant.entity";
import { assertCanCreateParticipant } from "../../domain/participant.rules";
import { toParticipantDto } from "../dtos/participant.dto";

type Input = {
  tournamentId: string; // @relation(Tournament)
  teamId?: string; // @relation(Team)
  userId?: string; // @relation(User)
  type: ParticipantType;
  status: ParticipantStatus;
  participantRepository: ParticipantRepository;
};

export async function createParticipantUseCase(input: Input) {
  assertCanCreateParticipant();

  const participant = await input.participantRepository.create({
    tournamentId: input.tournamentId,
    teamId: input.teamId,
    userId: input.userId,
    type: input.type,
    status: input.status,
  });

  return toParticipantDto(participant);
}
