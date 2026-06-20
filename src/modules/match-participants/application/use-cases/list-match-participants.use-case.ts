import type { MatchParticipantRepository } from "../../domain/match-participant.repository";
import { toMatchParticipantDto } from "../dtos/match-participant.dto";

type Input = {
  matchParticipantRepository: MatchParticipantRepository;
};

export async function listMatchParticipantsUseCase(input: Input) {
  const matchParticipants = await input.matchParticipantRepository.findMany();

  return matchParticipants.map(toMatchParticipantDto);
}
