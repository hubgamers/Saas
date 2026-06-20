import type { MatchParticipantRepository } from "../../domain/match-participant.repository";
import { assertCanCreateMatchParticipant } from "../../domain/match-participant.rules";
import { toMatchParticipantDto } from "../dtos/match-participant.dto";

type Input = {
  matchId: string; // @relation(Match)
  participantId: string; // @relation(Participant)
  teamId?: string; // @relation(Team)
  userId?: string; // @relation(User)
  score?: number;
  placement?: number;
  isWinner: boolean;
  matchParticipantRepository: MatchParticipantRepository;
};

export async function createMatchParticipantUseCase(input: Input) {
  assertCanCreateMatchParticipant();

  const matchParticipant = await input.matchParticipantRepository.create({
    matchId: input.matchId,
    participantId: input.participantId,
    teamId: input.teamId,
    userId: input.userId,
    score: input.score,
    placement: input.placement,
    isWinner: input.isWinner,
  });

  return toMatchParticipantDto(matchParticipant);
}
