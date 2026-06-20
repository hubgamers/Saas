import type { EventTournamentRepository } from "../../domain/event-tournament.repository";
import { assertCanCreateEventTournament } from "../../domain/event-tournament.rules";
import { toEventTournamentDto } from "../dtos/event-tournament.dto";

type Input = {
  eventId: string; // @relation(Event)
  tournamentId: string; // @relation(Tournament)
  sortOrder: number;
  eventTournamentRepository: EventTournamentRepository;
};

export async function createEventTournamentUseCase(input: Input) {
  assertCanCreateEventTournament();

  const eventTournament = await input.eventTournamentRepository.create({
    eventId: input.eventId,
    tournamentId: input.tournamentId,
    sortOrder: input.sortOrder,
  });

  return toEventTournamentDto(eventTournament);
}
