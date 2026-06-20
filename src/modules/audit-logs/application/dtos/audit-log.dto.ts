export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { AuditLog } from "../../domain/audit-log.entity";

export type AuditLogDto = {
  id: string;
  organizationId: string;
  organization?: RelationReferenceDto;
  actorId: string;
  actor?: RelationReferenceDto;
  action: string;
  entityType: string;
  entityId?: string;
  metadataJson?: string;
  createdAt: string;
};

export function toAuditLogDto(auditLog: AuditLog): AuditLogDto {
  return {
    id: auditLog.id,
    organizationId: auditLog.organizationId,
    organization: auditLog.organization,
    actorId: auditLog.actorId,
    actor: auditLog.actor,
    action: auditLog.action,
    entityType: auditLog.entityType,
    entityId: auditLog.entityId,
    metadataJson: auditLog.metadataJson,
    createdAt: auditLog.createdAt.toISOString(),
  };
}
