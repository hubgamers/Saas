export type RelationReference = {
  id: string;
  label?: string;
};

export const ParticipantTypeValues = ["TEAM", "USER"] as const;
export type ParticipantType = (typeof ParticipantTypeValues)[number];

export const ParticipantStatusValues = ["INVITED", "REGISTERED", "CHECKED_IN", "DISQUALIFIED"] as const;
export type ParticipantStatus = (typeof ParticipantStatusValues)[number];

export type Participant = {
  id: string;
  tournamentId: string;
  tournament?: RelationReference;
  teamId?: string;
  team?: RelationReference;
  userId?: string;
  user?: RelationReference;
  type: ParticipantType;
  status: ParticipantStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type NewParticipant = {
  tournamentId: string; // @relation(Tournament)
  teamId?: string; // @relation(Team)
  userId?: string; // @relation(User)
  type: ParticipantType;
  status: ParticipantStatus;
};
