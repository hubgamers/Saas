"use server";

import { revalidatePath } from "next/cache";
import { BroadcastPlatformValues, BroadcastStatusValues } from "../domain/broadcast.entity";
import { createBroadcastUseCase } from "../application/use-cases/create-broadcast.use-case";
import { prismaBroadcastRepository } from "../infrastructure/prisma-broadcast.repository";

export async function createBroadcastAction(formData: FormData) {
  await createBroadcastUseCase({
    eventId: readString(formData, "eventId", true),
    tournamentId: readString(formData, "tournamentId", false),
    platform: readEnum(formData, "platform", BroadcastPlatformValues, true),
    channelName: readString(formData, "channelName", true),
    streamUrl: readString(formData, "streamUrl", true),
    status: readEnum(formData, "status", BroadcastStatusValues, true),
    recordingUrl: readString(formData, "recordingUrl", false),
    startedAt: readDate(formData, "startedAt", false),
    endedAt: readDate(formData, "endedAt", false),
    delaySeconds: readNumber(formData, "delaySeconds", false),
    broadcastRepository: prismaBroadcastRepository,
  });

  revalidatePath("/broadcasts");
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
