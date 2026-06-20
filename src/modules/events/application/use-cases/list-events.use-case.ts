import type { EventRepository } from "../../domain/event.repository";
import { toEventDto } from "../dtos/event.dto";

type Input = {
  eventRepository: EventRepository;
};

export async function listEventsUseCase(input: Input) {
  const events = await input.eventRepository.findMany();

  return events.map(toEventDto);
}
