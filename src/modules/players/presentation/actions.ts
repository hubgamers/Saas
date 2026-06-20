"use server";

import { revalidatePath } from "next/cache";
import { createPlayerUseCase } from "../application/use-cases/create-player.use-case";
import { prismaPlayerRepository } from "../infrastructure/prisma-player.repository";

export async function createPlayerAction(formData: FormData) {
  await createPlayerUseCase({
    teamId: readString(formData, "teamId", true),
    userId: readString(formData, "userId", true),
    nickname: readString(formData, "nickname", true),
    playerRepository: prismaPlayerRepository,
  });

  revalidatePath("/players");
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
