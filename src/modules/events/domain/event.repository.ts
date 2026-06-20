import type { NewEvent, Event } from "./event.entity";

export interface EventRepository {
  findMany(): Promise<Event[]>;
  create(data: NewEvent): Promise<Event>;
}
