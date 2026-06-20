import type { GameRepository } from "../../domain/game.repository";
import { assertCanCreateGame } from "../../domain/game.rules";
import { toGameDto } from "../dtos/game.dto";

type Input = {
  name: string;
  platform: string;
  gameRepository: GameRepository;
};

export async function createGameUseCase(input: Input) {
  assertCanCreateGame();

  const game = await input.gameRepository.create({
    name: input.name,
    platform: input.platform,
  });

  return toGameDto(game);
}
