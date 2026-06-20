import type { AuditLogRepository } from "../../domain/audit-log.repository";
import { toAuditLogDto } from "../dtos/audit-log.dto";

type Input = {
  auditLogRepository: AuditLogRepository;
};

export async function listAuditLogsUseCase(input: Input) {
  const auditLogs = await input.auditLogRepository.findMany();

  return auditLogs.map(toAuditLogDto);
}
