"use server";

import { revalidatePath } from "next/cache";
import { createMatchParticipantUseCase } from "../application/use-cases/create-match-participant.use-case";
import { prismaMatchParticipantRepository } from "../infrastructure/prisma-match-participant.repository";

export async function createMatchParticipantAction(formData: FormData) {
  await createMatchParticipantUseCase({
    matchId: readString(formData, "matchId", true),
    participantId: readString(formData, "participantId", true),
    teamId: readString(formData, "teamId", false),
    userId: readString(formData, "userId", false),
    score: readNumber(formData, "score", false),
    placement: readNumber(formData, "placement", false),
    isWinner: readBoolean(formData, "isWinner"),
    matchParticipantRepository: prismaMatchParticipantRepository,
  });

  revalidatePath("/match-participants");
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
