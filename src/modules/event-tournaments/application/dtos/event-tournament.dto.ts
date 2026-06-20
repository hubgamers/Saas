export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { EventTournament } from "../../domain/event-tournament.entity";

export type EventTournamentDto = {
  id: string;
  eventId: string;
  event?: RelationReferenceDto;
  tournamentId: string;
  tournament?: RelationReferenceDto;
  sortOrder: number;
  createdAt: string;
};

export function toEventTournamentDto(eventTournament: EventTournament): EventTournamentDto {
  return {
    id: eventTournament.id,
    eventId: eventTournament.eventId,
    event: eventTournament.event,
    tournamentId: eventTournament.tournamentId,
    tournament: eventTournament.tournament,
    sortOrder: eventTournament.sortOrder,
    createdAt: eventTournament.createdAt.toISOString(),
  };
}
