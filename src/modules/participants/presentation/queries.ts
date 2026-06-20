import { listParticipantsUseCase } from "../application/use-cases/list-participants.use-case";
import { prismaParticipantRepository } from "../infrastructure/prisma-participant.repository";

export async function getParticipants() {
  return listParticipantsUseCase({
    participantRepository: prismaParticipantRepository,
  });
}
