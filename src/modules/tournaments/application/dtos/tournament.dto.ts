export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { Tournament, TournamentFormat, TournamentStatus } from "../../domain/tournament.entity";

export type TournamentDto = {
  id: string;
  name: string;
  gameId: string;
  game?: RelationReferenceDto;
  organizationId: string;
  organization?: RelationReferenceDto;
  description?: string;
  format: TournamentFormat;
  maxTeams: number;
  maxPlayerPerTeam: number;
  registrationStart: string;
  registrationEnd: string;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  bannerUrl?: string;
  rules?: string;
  prizePool?: string;
  createdAt: string;
};

export function toTournamentDto(tournament: Tournament): TournamentDto {
  return {
    id: tournament.id,
    name: tournament.name,
    gameId: tournament.gameId,
    game: tournament.game,
    organizationId: tournament.organizationId,
    organization: tournament.organization,
    description: tournament.description,
    format: tournament.format,
    maxTeams: tournament.maxTeams,
    maxPlayerPerTeam: tournament.maxPlayerPerTeam,
    registrationStart: tournament.registrationStart.toISOString(),
    registrationEnd: tournament.registrationEnd.toISOString(),
    startDate: tournament.startDate.toISOString(),
    endDate: tournament.endDate.toISOString(),
    status: tournament.status,
    bannerUrl: tournament.bannerUrl,
    rules: tournament.rules,
    prizePool: tournament.prizePool,
    createdAt: tournament.createdAt.toISOString(),
  };
}
