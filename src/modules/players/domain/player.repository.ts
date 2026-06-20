import type { NewPlayer, Player } from "./player.entity";

export interface PlayerRepository {
  findMany(): Promise<Player[]>;
  create(data: NewPlayer): Promise<Player>;
}
