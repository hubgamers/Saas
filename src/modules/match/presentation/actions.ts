"use server";

import { revalidatePath } from "next/cache";
import { MatchStatusValues } from "../domain/match.entity";
import { createMatchUseCase } from "../application/use-cases/create-match.use-case";
import { prismaMatchRepository } from "../infrastructure/prisma-match.repository";

export async function createMatchAction(formData: FormData) {
  await createMatchUseCase({
    phaseId: readString(formData, "phaseId", true),
    roundNumber: readNumber(formData, "roundNumber", true),
    teamOneId: readString(formData, "teamOneId", true),
    teamTwoId: readString(formData, "teamTwoId", true),
    winnerId: readString(formData, "winnerId", false),
    scheduledAt: readDate(formData, "scheduledAt", true),
    startedAt: readDate(formData, "startedAt", false),
    endedAt: readDate(formData, "endedAt", false),
    status: readEnum(formData, "status", MatchStatusValues, true),
    scoreTeamOne: readNumber(formData, "scoreTeamOne", false),
    scoreTeamTwo: readNumber(formData, "scoreTeamTwo", false),
    matchRepository: prismaMatchRepository,
  });

  revalidatePath("/match");
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
