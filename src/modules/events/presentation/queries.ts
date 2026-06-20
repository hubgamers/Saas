import { listEventsUseCase } from "../application/use-cases/list-events.use-case";
import { prismaEventRepository } from "../infrastructure/prisma-event.repository";

export async function getEvents() {
  return listEventsUseCase({
    eventRepository: prismaEventRepository,
  });
}
