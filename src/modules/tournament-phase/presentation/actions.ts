"use server";

import { revalidatePath } from "next/cache";
import { TournamentPhaseTypeValues, TournamentPhaseStatusValues } from "../domain/tournament-phase.entity";
import { createTournamentPhaseUseCase } from "../application/use-cases/create-tournament-phase.use-case";
import { prismaTournamentPhaseRepository } from "../infrastructure/prisma-tournament-phase.repository";

export async function createTournamentPhaseAction(formData: FormData) {
  await createTournamentPhaseUseCase({
    tournamentId: readString(formData, "tournamentId", true),
    name: readString(formData, "name", true),
    type: readEnum(formData, "type", TournamentPhaseTypeValues, true),
    order: readNumber(formData, "order", true),
    startsAt: readDate(formData, "startsAt", true),
    endsAt: readDate(formData, "endsAt", false),
    status: readEnum(formData, "status", TournamentPhaseStatusValues, true),
    tournamentPhaseRepository: prismaTournamentPhaseRepository,
  });

  revalidatePath("/tournament-phase");
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
