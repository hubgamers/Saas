export type RelationReference = {
  id: string;
  label?: string;
};

export type MatchParticipant = {
  id: string;
  matchId: string;
  match?: RelationReference;
  participantId: string;
  participant?: RelationReference;
  teamId?: string;
  team?: RelationReference;
  userId?: string;
  user?: RelationReference;
  score?: number;
  placement?: number;
  isWinner: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NewMatchParticipant = {
  matchId: string; // @relation(Match)
  participantId: string; // @relation(Participant)
  teamId?: string; // @relation(Team)
  userId?: string; // @relation(User)
  score?: number;
  placement?: number;
  isWinner: boolean;
};
