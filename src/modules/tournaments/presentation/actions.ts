"use server";

import { revalidatePath } from "next/cache";
import { TournamentFormatValues, TournamentStatusValues } from "../domain/tournament.entity";
import { createTournamentUseCase } from "../application/use-cases/create-tournament.use-case";
import { prismaTournamentRepository } from "../infrastructure/prisma-tournament.repository";

export async function createTournamentAction(formData: FormData) {
  await createTournamentUseCase({
    name: readString(formData, "name", true),
    gameId: readString(formData, "gameId", true),
    organizationId: readString(formData, "organizationId", true),
    description: readString(formData, "description", false),
    format: readEnum(formData, "format", TournamentFormatValues, true),
    maxTeams: readNumber(formData, "maxTeams", true),
    maxPlayerPerTeam: readNumber(formData, "maxPlayerPerTeam", true),
    registrationStart: readDate(formData, "registrationStart", true),
    registrationEnd: readDate(formData, "registrationEnd", true),
    startDate: readDate(formData, "startDate", true),
    endDate: readDate(formData, "endDate", true),
    status: readEnum(formData, "status", TournamentStatusValues, true),
    bannerUrl: readString(formData, "bannerUrl", false),
    rules: readString(formData, "rules", false),
    prizePool: readString(formData, "prizePool", false),
    tournamentRepository: prismaTournamentRepository,
  });

  revalidatePath("/tournaments");
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
