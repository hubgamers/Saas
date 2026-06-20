export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { MatchParticipant } from "../../domain/match-participant.entity";

export type MatchParticipantDto = {
  id: string;
  matchId: string;
  match?: RelationReferenceDto;
  participantId: string;
  participant?: RelationReferenceDto;
  teamId?: string;
  team?: RelationReferenceDto;
  userId?: string;
  user?: RelationReferenceDto;
  score?: number;
  placement?: number;
  isWinner: boolean;
  createdAt: string;
};

export function toMatchParticipantDto(matchParticipant: MatchParticipant): MatchParticipantDto {
  return {
    id: matchParticipant.id,
    matchId: matchParticipant.matchId,
    match: matchParticipant.match,
    participantId: matchParticipant.participantId,
    participant: matchParticipant.participant,
    teamId: matchParticipant.teamId,
    team: matchParticipant.team,
    userId: matchParticipant.userId,
    user: matchParticipant.user,
    score: matchParticipant.score,
    placement: matchParticipant.placement,
    isWinner: matchParticipant.isWinner,
    createdAt: matchParticipant.createdAt.toISOString(),
  };
}
