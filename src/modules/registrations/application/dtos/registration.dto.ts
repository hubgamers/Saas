export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { Registration, RegistrationStatus } from "../../domain/registration.entity";

export type RegistrationDto = {
  id: string;
  tournamentId: string;
  tournament?: RelationReferenceDto;
  teamId: string;
  team?: RelationReferenceDto;
  registeredById: string;
  registeredBy?: RelationReferenceDto;
  status: RegistrationStatus;
  createdAt: string;
};

export function toRegistrationDto(registration: Registration): RegistrationDto {
  return {
    id: registration.id,
    tournamentId: registration.tournamentId,
    tournament: registration.tournament,
    teamId: registration.teamId,
    team: registration.team,
    registeredById: registration.registeredById,
    registeredBy: registration.registeredBy,
    status: registration.status,
    createdAt: registration.createdAt.toISOString(),
  };
}
