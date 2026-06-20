import type { NewEventTournament, EventTournament } from "./event-tournament.entity";

export interface EventTournamentRepository {
  findMany(): Promise<EventTournament[]>;
  create(data: NewEventTournament): Promise<EventTournament>;
}
