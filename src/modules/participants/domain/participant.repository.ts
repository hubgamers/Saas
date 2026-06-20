import type { NewParticipant, Participant } from "./participant.entity";

export interface ParticipantRepository {
  findMany(): Promise<Participant[]>;
  create(data: NewParticipant): Promise<Participant>;
}
