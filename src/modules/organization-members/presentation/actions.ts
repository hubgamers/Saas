"use server";

import { revalidatePath } from "next/cache";
import { OrganizationMemberRoleValues } from "../domain/organization-member.entity";
import { createOrganizationMemberUseCase } from "../application/use-cases/create-organization-member.use-case";
import { prismaOrganizationMemberRepository } from "../infrastructure/prisma-organization-member.repository";

export async function createOrganizationMemberAction(formData: FormData) {
  await createOrganizationMemberUseCase({
    organizationId: readString(formData, "organizationId", true),
    userId: readString(formData, "userId", true),
    role: readEnum(formData, "role", OrganizationMemberRoleValues, true),
    organizationMemberRepository: prismaOrganizationMemberRepository,
  });

  revalidatePath("/organization-members");
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
