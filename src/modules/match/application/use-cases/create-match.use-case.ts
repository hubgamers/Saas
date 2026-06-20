import type { MatchRepository } from "../../domain/match.repository";
import type { MatchStatus } from "../../domain/match.entity";
import { assertCanCreateMatch } from "../../domain/match.rules";
import { toMatchDto } from "../dtos/match.dto";

type Input = {
  phaseId: string; // @relation(TournamentPhase)
  roundNumber: number;
  teamOneId: string; // @relation(Team)
  teamTwoId: string; // @relation(Team)
  winnerId?: string; // @relation(Team)
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: MatchStatus;
  scoreTeamOne?: number;
  scoreTeamTwo?: number;
  matchRepository: MatchRepository;
};

export async function createMatchUseCase(input: Input) {
  assertCanCreateMatch();

  const match = await input.matchRepository.create({
    phaseId: input.phaseId,
    roundNumber: input.roundNumber,
    teamOneId: input.teamOneId,
    teamTwoId: input.teamTwoId,
    winnerId: input.winnerId,
    scheduledAt: input.scheduledAt,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    status: input.status,
    scoreTeamOne: input.scoreTeamOne,
    scoreTeamTwo: input.scoreTeamTwo,
  });

  return toMatchDto(match);
}
