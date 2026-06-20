import type { NewTeam, Team } from "./team.entity";

export interface TeamRepository {
  findMany(): Promise<Team[]>;
  create(data: NewTeam): Promise<Team>;
}
