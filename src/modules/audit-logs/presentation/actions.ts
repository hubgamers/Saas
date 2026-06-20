"use server";

import { revalidatePath } from "next/cache";
import { createAuditLogUseCase } from "../application/use-cases/create-audit-log.use-case";
import { prismaAuditLogRepository } from "../infrastructure/prisma-audit-log.repository";

export async function createAuditLogAction(formData: FormData) {
  await createAuditLogUseCase({
    organizationId: readString(formData, "organizationId", true),
    actorId: readString(formData, "actorId", true),
    action: readString(formData, "action", true),
    entityType: readString(formData, "entityType", true),
    entityId: readString(formData, "entityId", false),
    metadataJson: readString(formData, "metadataJson", false),
    auditLogRepository: prismaAuditLogRepository,
  });

  revalidatePath("/audit-logs");
}

function readString(formData: FormData, key: string, required: true): string;
function readString(formData: FormData, key: string, required: false): string | undefined;
function readString(formData: FormData, key: string, required: boolean) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value && required) {
    throw new Error(`Le champ ${key} est requis.`);
  }

  return value || undefined;
}
