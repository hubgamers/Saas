"use server";

import { revalidatePath } from "next/cache";
import { RegistrationStatusValues } from "../domain/registration.entity";
import { createRegistrationUseCase } from "../application/use-cases/create-registration.use-case";
import { prismaRegistrationRepository } from "../infrastructure/prisma-registration.repository";

export async function createRegistrationAction(formData: FormData) {
  await createRegistrationUseCase({
    tournamentId: readString(formData, "tournamentId", true),
    teamId: readString(formData, "teamId", true),
    registeredById: readString(formData, "registeredById", true),
    status: readEnum(formData, "status", RegistrationStatusValues, true),
    registrationRepository: prismaRegistrationRepository,
  });

  revalidatePath("/registrations");
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
