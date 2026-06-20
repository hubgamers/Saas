"use server";

import { revalidatePath } from "next/cache";
import { createUserUseCase } from "../application/use-cases/create-user.use-case";
import { prismaUserRepository } from "../infrastructure/prisma-user.repository";

export async function createUserAction(formData: FormData) {
  await createUserUseCase({
    username: readString(formData, "username", true),
    passwordHash: readString(formData, "passwordHash", true),
    firstName: readString(formData, "firstName", false),
    lastName: readString(formData, "lastName", false),
    email: readString(formData, "email", true),
    avatarUrl: readString(formData, "avatarUrl", false),
    userRepository: prismaUserRepository,
  });

  revalidatePath("/users");
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
