export type RelationReference = {
  id: string;
  label?: string;
};

export type AuditLog = {
  id: string;
  organizationId: string;
  organization?: RelationReference;
  actorId: string;
  actor?: RelationReference;
  action: string;
  entityType: string;
  entityId?: string;
  metadataJson?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewAuditLog = {
  organizationId: string; // @relation(Organization)
  actorId: string; // @relation(User)
  action: string;
  entityType: string;
  entityId?: string;
  metadataJson?: string;
};
