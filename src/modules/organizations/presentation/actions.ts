"use server";

import { revalidatePath } from "next/cache";
import { createOrganizationUseCase } from "../application/use-cases/create-organization.use-case";
import { prismaOrganizationRepository } from "../infrastructure/prisma-organization.repository";

export async function createOrganizationAction(formData: FormData) {
  await createOrganizationUseCase({
    name: readString(formData, "name", true),
    ownerId: readString(formData, "ownerId", true),
    slug: readString(formData, "slug", true),
    logoUrl: readString(formData, "logoUrl", false),
    organizationRepository: prismaOrganizationRepository,
  });

  revalidatePath("/organizations");
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
