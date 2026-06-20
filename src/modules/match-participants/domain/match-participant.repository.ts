import type { NewMatchParticipant, MatchParticipant } from "./match-participant.entity";

export interface MatchParticipantRepository {
  findMany(): Promise<MatchParticipant[]>;
  create(data: NewMatchParticipant): Promise<MatchParticipant>;
}
