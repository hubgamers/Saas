export type RelationReference = {
  id: string;
  label?: string;
};

export const MatchStatusValues = ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"] as const;
export type MatchStatus = (typeof MatchStatusValues)[number];

export type Match = {
  id: string;
  phaseId: string;
  phase?: RelationReference;
  roundNumber: number;
  teamOneId: string;
  teamOne?: RelationReference;
  teamTwoId: string;
  teamTwo?: RelationReference;
  winnerId?: string;
  winner?: RelationReference;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: MatchStatus;
  scoreTeamOne?: number;
  scoreTeamTwo?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type NewMatch = {
  phaseId: string; // @relation(TournamentPhase)
  roundNumber: number;
  teamOneId: string; // @relation(Team)
  teamTwoId: string; // @relation(Team)
  winnerId?: string; // @relation(Team)
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: MatchStatus;
  scoreTeamOne?: number;
  scoreTeamTwo?: number;
};
