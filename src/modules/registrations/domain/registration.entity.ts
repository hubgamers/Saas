export type RelationReference = {
  id: string;
  label?: string;
};

export const RegistrationStatusValues = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;
export type RegistrationStatus = (typeof RegistrationStatusValues)[number];

export type Registration = {
  id: string;
  tournamentId: string;
  tournament?: RelationReference;
  teamId: string;
  team?: RelationReference;
  registeredById: string;
  registeredBy?: RelationReference;
  status: RegistrationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type NewRegistration = {
  tournamentId: string; // @relation(Tournament)
  teamId: string; // @relation(Team)
  registeredById: string; // @relation(User)
  status: RegistrationStatus;
};
