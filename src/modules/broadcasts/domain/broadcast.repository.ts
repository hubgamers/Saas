import type { NewBroadcast, Broadcast } from "./broadcast.entity";

export interface BroadcastRepository {
  findMany(): Promise<Broadcast[]>;
  create(data: NewBroadcast): Promise<Broadcast>;
}
