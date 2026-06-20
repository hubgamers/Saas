export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { Participant, ParticipantType, ParticipantStatus } from "../../domain/participant.entity";

export type ParticipantDto = {
  id: string;
  tournamentId: string;
  tournament?: RelationReferenceDto;
  teamId?: string;
  team?: RelationReferenceDto;
  userId?: string;
  user?: RelationReferenceDto;
  type: ParticipantType;
  status: ParticipantStatus;
  createdAt: string;
};

export function toParticipantDto(participant: Participant): ParticipantDto {
  return {
    id: participant.id,
    tournamentId: participant.tournamentId,
    tournament: participant.tournament,
    teamId: participant.teamId,
    team: participant.team,
    userId: participant.userId,
    user: participant.user,
    type: participant.type,
    status: participant.status,
    createdAt: participant.createdAt.toISOString(),
  };
}
