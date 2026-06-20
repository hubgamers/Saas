"use server";

import { revalidatePath } from "next/cache";
import { ParticipantTypeValues, ParticipantStatusValues } from "../domain/participant.entity";
import { createParticipantUseCase } from "../application/use-cases/create-participant.use-case";
import { prismaParticipantRepository } from "../infrastructure/prisma-participant.repository";

export async function createParticipantAction(formData: FormData) {
  await createParticipantUseCase({
    tournamentId: readString(formData, "tournamentId", true),
    teamId: readString(formData, "teamId", false),
    userId: readString(formData, "userId", false),
    type: readEnum(formData, "type", ParticipantTypeValues, true),
    status: readEnum(formData, "status", ParticipantStatusValues, true),
    participantRepository: prismaParticipantRepository,
  });

  revalidatePath("/participants");
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
