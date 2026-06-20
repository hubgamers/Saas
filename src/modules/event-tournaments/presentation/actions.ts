"use server";

import { revalidatePath } from "next/cache";
import { createEventTournamentUseCase } from "../application/use-cases/create-event-tournament.use-case";
import { prismaEventTournamentRepository } from "../infrastructure/prisma-event-tournament.repository";

export async function createEventTournamentAction(formData: FormData) {
  await createEventTournamentUseCase({
    eventId: readString(formData, "eventId", true),
    tournamentId: readString(formData, "tournamentId", true),
    sortOrder: readNumber(formData, "sortOrder", true),
    eventTournamentRepository: prismaEventTournamentRepository,
  });

  revalidatePath("/event-tournaments");
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
