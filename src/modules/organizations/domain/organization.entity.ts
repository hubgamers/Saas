export type RelationReference = {
  id: string;
  label?: string;
};

export type Organization = {
  id: string;
  name: string;
  ownerId: string;
  owner?: RelationReference;
  slug: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewOrganization = {
  name: string;
  ownerId: string; // @relation(User)
  slug: string;
  logoUrl?: string;
};
