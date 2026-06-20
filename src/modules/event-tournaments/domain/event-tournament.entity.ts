export type RelationReference = {
  id: string;
  label?: string;
};

export type EventTournament = {
  id: string;
  eventId: string;
  event?: RelationReference;
  tournamentId: string;
  tournament?: RelationReference;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type NewEventTournament = {
  eventId: string; // @relation(Event)
  tournamentId: string; // @relation(Tournament)
  sortOrder: number;
};
