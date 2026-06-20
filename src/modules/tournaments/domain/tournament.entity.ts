export type RelationReference = {
  id: string;
  label?: string;
};

export const TournamentFormatValues = ["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION", "ROUND_ROBIN", "SWISS", "LEAGUE"] as const;
export type TournamentFormat = (typeof TournamentFormatValues)[number];

export const TournamentStatusValues = ["DRAFT", "PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "LIVE", "COMPLETED", "CANCELLED"] as const;
export type TournamentStatus = (typeof TournamentStatusValues)[number];

export type Tournament = {
  id: string;
  name: string;
  gameId: string;
  game?: RelationReference;
  organizationId: string;
  organization?: RelationReference;
  description?: string;
  format: TournamentFormat;
  maxTeams: number;
  maxPlayerPerTeam: number;
  registrationStart: Date;
  registrationEnd: Date;
  startDate: Date;
  endDate: Date;
  status: TournamentStatus;
  bannerUrl?: string;
  rules?: string;
  prizePool?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewTournament = {
  name: string;
  gameId: string; // @relation(Game)
  organizationId: string; // @relation(Organization)
  description?: string;
  format: TournamentFormat;
  maxTeams: number;
  maxPlayerPerTeam: number;
  registrationStart: Date;
  registrationEnd: Date;
  startDate: Date;
  endDate: Date;
  status: TournamentStatus;
  bannerUrl?: string;
  rules?: string;
  prizePool?: string;
};
