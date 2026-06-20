import { listAuditLogsUseCase } from "../application/use-cases/list-audit-logs.use-case";
import { prismaAuditLogRepository } from "../infrastructure/prisma-audit-log.repository";

export async function getAuditLogs() {
  return listAuditLogsUseCase({
    auditLogRepository: prismaAuditLogRepository,
  });
}
