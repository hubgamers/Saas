"use server";

import { revalidatePath } from "next/cache";
import { TeamStatusValues } from "../domain/team.entity";
import { createTeamUseCase } from "../application/use-cases/create-team.use-case";
import { prismaTeamRepository } from "../infrastructure/prisma-team.repository";

export async function createTeamAction(formData: FormData) {
  await createTeamUseCase({
    name: readString(formData, "name", true),
    logoUrl: readString(formData, "logoUrl", false),
    managerId: readString(formData, "managerId", true),
    status: readEnum(formData, "status", TeamStatusValues, true),
    teamRepository: prismaTeamRepository,
  });

  revalidatePath("/teams");
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
