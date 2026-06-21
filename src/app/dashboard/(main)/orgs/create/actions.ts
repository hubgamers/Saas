"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import type { OrganizationDto } from "@/modules/organizations/application/dtos/organization.dto"
import { createOrganizationUseCase } from "@/modules/organizations/application/use-cases/create-organization.use-case"
import { ACTIVE_ORGANIZATION_COOKIE } from "@/modules/organizations/presentation/constants"
import { getCurrentPrismaUser } from "@/modules/organizations/presentation/current-user"
import { prismaOrganizationRepository } from "@/modules/organizations/infrastructure/prisma-organization.repository"

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
  slug: z
    .string()
    .trim()
    .min(2, "Le slug doit contenir au moins 2 caractères.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug doit utiliser des lettres minuscules, chiffres et tirets."),
  logoUrl: z
    .string()
    .trim()
    .url("L'URL du logo est invalide.")
    .optional()
    .or(z.literal("")),
})

export async function createOrg(formData: FormData) {
  const owner = await getCurrentPrismaUser()

  if (!owner) {
    redirect("/login")
  }

  const fields = createOrganizationSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    logoUrl: formData.get("logoUrl"),
  })

  const organization: OrganizationDto = await createOrganizationUseCase({
    name: fields.name,
    ownerId: owner.id,
    slug: fields.slug,
    logoUrl: fields.logoUrl || undefined,
    organizationRepository: prismaOrganizationRepository,
  })
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_ORGANIZATION_COOKIE, organization.id, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/orgs")
  redirect(`/dashboard/org/${organization.id}`)
}
