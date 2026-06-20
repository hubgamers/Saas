"use server";

import { revalidatePath } from "next/cache";
import { createOverlayAccessTokenUseCase } from "../application/use-cases/create-overlay-access-token.use-case";
import { prismaOverlayAccessTokenRepository } from "../infrastructure/prisma-overlay-access-token.repository";

export async function createOverlayAccessTokenAction(formData: FormData) {
  await createOverlayAccessTokenUseCase({
    sceneId: readString(formData, "sceneId", true),
    label: readString(formData, "label", true),
    tokenHash: readString(formData, "tokenHash", true),
    expiresAt: readDate(formData, "expiresAt", false),
    revokedAt: readDate(formData, "revokedAt", false),
    lastUsedAt: readDate(formData, "lastUsedAt", true),
    overlayAccessTokenRepository: prismaOverlayAccessTokenRepository,
  });

  revalidatePath("/overlay-access-tokens");
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

function readDate(formData: FormData, key: string, required: true): Date;
function readDate(formData: FormData, key: string, required: false): Date | undefined;
function readDate(formData: FormData, key: string, required: boolean) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value && !required) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Le champ ${key} doit etre une date valide.`);
  }

  return date;
}
