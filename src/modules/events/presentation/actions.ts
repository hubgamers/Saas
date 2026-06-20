"use server";

import { revalidatePath } from "next/cache";
import { EventTypeValues, EventStatusValues } from "../domain/event.entity";
import { createEventUseCase } from "../application/use-cases/create-event.use-case";
import { prismaEventRepository } from "../infrastructure/prisma-event.repository";

export async function createEventAction(formData: FormData) {
  await createEventUseCase({
    organizationId: readString(formData, "organizationId", true),
    name: readString(formData, "name", true),
    slug: readString(formData, "slug", true),
    description: readString(formData, "description", false),
    type: readEnum(formData, "type", EventTypeValues, true),
    startDate: readDate(formData, "startDate", true),
    endDate: readDate(formData, "endDate", true),
    status: readEnum(formData, "status", EventStatusValues, true),
    venueName: readString(formData, "venueName", false),
    venueAddress: readString(formData, "venueAddress", false),
    bannerUrl: readString(formData, "bannerUrl", false),
    eventRepository: prismaEventRepository,
  });

  revalidatePath("/events");
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
