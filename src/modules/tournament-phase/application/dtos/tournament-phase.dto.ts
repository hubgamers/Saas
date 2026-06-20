export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { TournamentPhase, TournamentPhaseType, TournamentPhaseStatus } from "../../domain/tournament-phase.entity";

export type TournamentPhaseDto = {
  id: string;
  tournamentId: string;
  tournament?: RelationReferenceDto;
  name: string;
  type: TournamentPhaseType;
  order: number;
  startsAt: string;
  endsAt?: string;
  status: TournamentPhaseStatus;
  createdAt: string;
};

export function toTournamentPhaseDto(tournamentPhase: TournamentPhase): TournamentPhaseDto {
  return {
    id: tournamentPhase.id,
    tournamentId: tournamentPhase.tournamentId,
    tournament: tournamentPhase.tournament,
    name: tournamentPhase.name,
    type: tournamentPhase.type,
    order: tournamentPhase.order,
    startsAt: tournamentPhase.startsAt.toISOString(),
    endsAt: tournamentPhase.endsAt?.toISOString(),
    status: tournamentPhase.status,
    createdAt: tournamentPhase.createdAt.toISOString(),
  };
}
