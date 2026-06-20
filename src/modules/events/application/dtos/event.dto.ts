export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { Event, EventType, EventStatus } from "../../domain/event.entity";

export type EventDto = {
  id: string;
  organizationId: string;
  organization?: RelationReferenceDto;
  name: string;
  slug: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate: string;
  status: EventStatus;
  venueName?: string;
  venueAddress?: string;
  bannerUrl?: string;
  createdAt: string;
};

export function toEventDto(event: Event): EventDto {
  return {
    id: event.id,
    organizationId: event.organizationId,
    organization: event.organization,
    name: event.name,
    slug: event.slug,
    description: event.description,
    type: event.type,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    status: event.status,
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    bannerUrl: event.bannerUrl,
    createdAt: event.createdAt.toISOString(),
  };
}
