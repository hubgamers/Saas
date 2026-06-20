"use server";

import { revalidatePath } from "next/cache";
import { OverlayDataSourceTypeValues } from "../domain/overlay-data-source.entity";
import { createOverlayDataSourceUseCase } from "../application/use-cases/create-overlay-data-source.use-case";
import { prismaOverlayDataSourceRepository } from "../infrastructure/prisma-overlay-data-source.repository";

export async function createOverlayDataSourceAction(formData: FormData) {
  await createOverlayDataSourceUseCase({
    sceneId: readString(formData, "sceneId", true),
    name: readString(formData, "name", true),
    type: readEnum(formData, "type", OverlayDataSourceTypeValues, true),
    endpointUrl: readString(formData, "endpointUrl", true),
    refreshIntervalSeconds: readNumber(formData, "refreshIntervalSeconds", true),
    payloadMappingJson: readString(formData, "payloadMappingJson", false),
    isEnabled: readBoolean(formData, "isEnabled"),
    overlayDataSourceRepository: prismaOverlayDataSourceRepository,
  });

  revalidatePath("/overlay-data-sources");
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

function readNumber(formData: FormData, key: string, required: true): number;
function readNumber(formData: FormData, key: string, required: false): number | undefined;
function readNumber(formData: FormData, key: string, required: boolean) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value && !required) {
    return undefined;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`Le champ ${key} doit etre un nombre.`);
  }

  return number;
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
