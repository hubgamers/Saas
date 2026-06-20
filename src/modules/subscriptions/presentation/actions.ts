"use server";

import { revalidatePath } from "next/cache";
import { SubscriptionPlanValues, SubscriptionStatusValues } from "../domain/subscription.entity";
import { createSubscriptionUseCase } from "../application/use-cases/create-subscription.use-case";
import { prismaSubscriptionRepository } from "../infrastructure/prisma-subscription.repository";

export async function createSubscriptionAction(formData: FormData) {
  await createSubscriptionUseCase({
    organizationId: readString(formData, "organizationId", true),
    plan: readEnum(formData, "plan", SubscriptionPlanValues, true),
    status: readEnum(formData, "status", SubscriptionStatusValues, true),
    stripeCustomerId: readString(formData, "stripeCustomerId", true),
    stripeSubscriptionId: readString(formData, "stripeSubscriptionId", false),
    currentPeriodStart: readDate(formData, "currentPeriodStart", true),
    currentPeriodEnd: readDate(formData, "currentPeriodEnd", true),
    subscriptionRepository: prismaSubscriptionRepository,
  });

  revalidatePath("/subscriptions");
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

function readDate(formData: FormData, key: string, required: true): Date;
function readDate(formData: FormData, key: string, required: false): Date | undefined;
function readDate(formData: FormData, key: string, required: boolean) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value && !required) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Le champ ${key} doit etre une date valide.`);
  }

  return date;
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
