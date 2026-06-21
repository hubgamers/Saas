"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createOrganizationUseCase } from "../application/use-cases/create-organization.use-case";
import { getAccessibleOrganizationUseCase } from "../application/use-cases/get-accessible-organization.use-case";
import { prismaOrganizationRepository } from "../infrastructure/prisma-organization.repository";
import { ACTIVE_ORGANIZATION_COOKIE } from "./constants";
import { getCurrentPrismaUser } from "./current-user";

export async function setActiveOrganizationAction(formData: FormData) {
  const organizationId = readString(formData, "organizationId", true);
  const user = await getCurrentPrismaUser();

  if (!user) {
    redirect("/login");
  }

  const organization = await getAccessibleOrganizationUseCase({
    organizationId,
    userId: user.id,
    organizationRepository: prismaOrganizationRepository,
  });

  if (!organization) {
    throw new Error("Vous n'avez pas acces a cette organisation.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORGANIZATION_COOKIE, organization.id, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/org/${organization.id}`);
}

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
