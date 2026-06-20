export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { Match, MatchStatus } from "../../domain/match.entity";

export type MatchDto = {
  id: string;
  phaseId: string;
  phase?: RelationReferenceDto;
  roundNumber: number;
  teamOneId: string;
  teamOne?: RelationReferenceDto;
  teamTwoId: string;
  teamTwo?: RelationReferenceDto;
  winnerId?: string;
  winner?: RelationReferenceDto;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  status: MatchStatus;
  scoreTeamOne?: number;
  scoreTeamTwo?: number;
  createdAt: string;
};

export function toMatchDto(match: Match): MatchDto {
  return {
    id: match.id,
    phaseId: match.phaseId,
    phase: match.phase,
    roundNumber: match.roundNumber,
    teamOneId: match.teamOneId,
    teamOne: match.teamOne,
    teamTwoId: match.teamTwoId,
    teamTwo: match.teamTwo,
    winnerId: match.winnerId,
    winner: match.winner,
    scheduledAt: match.scheduledAt.toISOString(),
    startedAt: match.startedAt?.toISOString(),
    endedAt: match.endedAt?.toISOString(),
    status: match.status,
    scoreTeamOne: match.scoreTeamOne,
    scoreTeamTwo: match.scoreTeamTwo,
    createdAt: match.createdAt.toISOString(),
  };
}
