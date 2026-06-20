export type RelationReference = {
  id: string;
  label?: string;
};

export const TeamStatusValues = ["INVITED", "ACTIVE", "DISQUALIFIED"] as const;
export type TeamStatus = (typeof TeamStatusValues)[number];

export type Team = {
  id: string;
  name: string;
  logoUrl?: string;
  managerId: string;
  manager?: RelationReference;
  status: TeamStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type NewTeam = {
  name: string;
  logoUrl?: string;
  managerId: string; // @relation(User)
  status: TeamStatus;
};
