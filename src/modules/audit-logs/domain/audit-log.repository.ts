import type { NewAuditLog, AuditLog } from "./audit-log.entity";

export interface AuditLogRepository {
  findMany(): Promise<AuditLog[]>;
  create(data: NewAuditLog): Promise<AuditLog>;
}
