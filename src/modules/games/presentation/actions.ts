"use server";

import { revalidatePath } from "next/cache";
import { createGameUseCase } from "../application/use-cases/create-game.use-case";
import { prismaGameRepository } from "../infrastructure/prisma-game.repository";

export async function createGameAction(formData: FormData) {
  await createGameUseCase({
    name: readString(formData, "name", true),
    platform: readString(formData, "platform", true),
    gameRepository: prismaGameRepository,
  });

  revalidatePath("/games");
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
