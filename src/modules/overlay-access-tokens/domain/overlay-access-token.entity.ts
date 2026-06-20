export type RelationReference = {
  id: string;
  label?: string;
};

export type OverlayAccessToken = {
  id: string;
  sceneId: string;
  scene?: RelationReference;
  label: string;
  tokenHash: string;
  expiresAt?: Date;
  revokedAt?: Date;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type NewOverlayAccessToken = {
  sceneId: string; // @relation(OverlayScene)
  label: string;
  tokenHash: string;
  expiresAt?: Date;
  revokedAt?: Date;
  lastUsedAt: Date;
};
