"use server";

import { revalidatePath } from "next/cache";
import { createOverlayThemeUseCase } from "../application/use-cases/create-overlay-theme.use-case";
import { prismaOverlayThemeRepository } from "../infrastructure/prisma-overlay-theme.repository";

export async function createOverlayThemeAction(formData: FormData) {
  await createOverlayThemeUseCase({
    organizationId: readString(formData, "organizationId", true),
    name: readString(formData, "name", true),
    primaryColor: readString(formData, "primaryColor", true),
    secondaryColor: readString(formData, "secondaryColor", true),
    accentColor: readString(formData, "accentColor", true),
    fontFamily: readString(formData, "fontFamily", false),
    logoUrl: readString(formData, "logoUrl", false),
    backgroundUrl: readString(formData, "backgroundUrl", false),
    overlayThemeRepository: prismaOverlayThemeRepository,
  });

  revalidatePath("/overlay-themes");
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
