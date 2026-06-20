export type RelationReference = {
  id: string;
  label?: string;
};

export type OverlayTheme = {
  id: string;
  organizationId: string;
  organization?: RelationReference;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily?: string;
  logoUrl?: string;
  backgroundUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewOverlayTheme = {
  organizationId: string; // @relation(Organization)
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily?: string;
  logoUrl?: string;
  backgroundUrl?: string;
};
