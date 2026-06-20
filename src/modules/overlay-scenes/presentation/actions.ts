"use server";

import { revalidatePath } from "next/cache";
import { OverlaySceneKindValues, OverlaySceneStatusValues } from "../domain/overlay-scene.entity";
import { createOverlaySceneUseCase } from "../application/use-cases/create-overlay-scene.use-case";
import { prismaOverlaySceneRepository } from "../infrastructure/prisma-overlay-scene.repository";

export async function createOverlaySceneAction(formData: FormData) {
  await createOverlaySceneUseCase({
    broadcastId: readString(formData, "broadcastId", true),
    themeId: readString(formData, "themeId", false),
    name: readString(formData, "name", true),
    kind: readEnum(formData, "kind", OverlaySceneKindValues, true),
    status: readEnum(formData, "status", OverlaySceneStatusValues, true),
    isActive: readBoolean(formData, "isActive"),
    configJson: readString(formData, "configJson", false),
    customCss: readString(formData, "customCss", false),
    overlaySceneRepository: prismaOverlaySceneRepository,
  });

  revalidatePath("/overlay-scenes");
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

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function readEnum<TValues extends readonly string[]>(
  formData: FormData,
  key: string,
  values: TValues,
  required: true,
): TValues[number];
function readEnum<TValues extends readonly string[]>(
  formData: FormData,
  key: string,
  values: TValues,
  required: false,
): TValues[number] | undefined;
function readEnum<TValues extends readonly string[]>(
  formData: FormData,
  key: string,
  values: TValues,
  required: boolean,
) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value && !required) {
    return undefined;
  }

  if (!values.includes(value)) {
    throw new Error(`Le champ ${key} doit etre une valeur autorisee: ${values.join(", ")}.`);
  }

  return value;
}
