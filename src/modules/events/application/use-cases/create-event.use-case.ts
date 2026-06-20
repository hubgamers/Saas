import type { EventRepository } from "../../domain/event.repository";
import type { EventType, EventStatus } from "../../domain/event.entity";
import { assertCanCreateEvent } from "../../domain/event.rules";
import { toEventDto } from "../dtos/event.dto";

type Input = {
  organizationId: string; // @relation(Organization)
  name: string;
  slug: string;
  description?: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  venueName?: string;
  venueAddress?: string;
  bannerUrl?: string;
  eventRepository: EventRepository;
};

export async function createEventUseCase(input: Input) {
  assertCanCreateEvent();

  const event = await input.eventRepository.create({
    organizationId: input.organizationId,
    name: input.name,
    slug: input.slug,
    description: input.description,
    type: input.type,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status,
    venueName: input.venueName,
    venueAddress: input.venueAddress,
    bannerUrl: input.bannerUrl,
  });

  return toEventDto(event);
}
