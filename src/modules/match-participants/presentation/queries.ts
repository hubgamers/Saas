import { listMatchParticipantsUseCase } from "../application/use-cases/list-match-participants.use-case";
import { prismaMatchParticipantRepository } from "../infrastructure/prisma-match-participant.repository";

export async function getMatchParticipants() {
  return listMatchParticipantsUseCase({
    matchParticipantRepository: prismaMatchParticipantRepository,
  });
}
