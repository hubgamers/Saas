import type { Game } from "../../domain/game.entity";

export type GameDto = {
  id: string;
  name: string;
  platform: string;
  createdAt: string;
};

export function toGameDto(game: Game): GameDto {
  return {
    id: game.id,
    name: game.name,
    platform: game.platform,
    createdAt: game.createdAt.toISOString(),
  };
}
