export type RelationReference = {
  id: string;
  label?: string;
};

export const TournamentPhaseTypeValues = ["GROUP_STAGE", "BRACKET", "SWISS", "FINAL"] as const;
export type TournamentPhaseType = (typeof TournamentPhaseTypeValues)[number];

export const TournamentPhaseStatusValues = ["PLANNED", "LIVE", "COMPLETED"] as const;
export type TournamentPhaseStatus = (typeof TournamentPhaseStatusValues)[number];

export type TournamentPhase = {
  id: string;
  tournamentId: string;
  tournament?: RelationReference;
  name: string;
  type: TournamentPhaseType;
  order: number;
  startsAt: Date;
  endsAt?: Date;
  status: TournamentPhaseStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type NewTournamentPhase = {
  tournamentId: string; // @relation(Tournament)
  name: string;
  type: TournamentPhaseType;
  order: number;
  startsAt: Date;
  endsAt?: Date;
  status: TournamentPhaseStatus;
};
