import type { AuditLogRepository } from "../domain/audit-log.repository";

export const prismaAuditLogRepository: AuditLogRepository = {
  findMany() {
    throw new Error("Implement prismaAuditLogRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaAuditLogRepository.create after adding the Prisma model.");
  },
};
