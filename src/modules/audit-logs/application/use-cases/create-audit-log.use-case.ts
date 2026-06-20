import type { AuditLogRepository } from "../../domain/audit-log.repository";
import { assertCanCreateAuditLog } from "../../domain/audit-log.rules";
import { toAuditLogDto } from "../dtos/audit-log.dto";

type Input = {
  organizationId: string; // @relation(Organization)
  actorId: string; // @relation(User)
  action: string;
  entityType: string;
  entityId?: string;
  metadataJson?: string;
  auditLogRepository: AuditLogRepository;
};

export async function createAuditLogUseCase(input: Input) {
  assertCanCreateAuditLog();

  const auditLog = await input.auditLogRepository.create({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadataJson: input.metadataJson,
  });

  return toAuditLogDto(auditLog);
}
