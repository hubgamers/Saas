import type { EventTournamentRepository } from "../../domain/event-tournament.repository";
import { toEventTournamentDto } from "../dtos/event-tournament.dto";

type Input = {
  eventTournamentRepository: EventTournamentRepository;
};

export async function listEventTournamentsUseCase(input: Input) {
  const eventTournaments = await input.eventTournamentRepository.findMany();

  return eventTournaments.map(toEventTournamentDto);
}
