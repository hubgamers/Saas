import type { NewGame, Game } from "./game.entity";

export interface GameRepository {
  findMany(): Promise<Game[]>;
  create(data: NewGame): Promise<Game>;
}
