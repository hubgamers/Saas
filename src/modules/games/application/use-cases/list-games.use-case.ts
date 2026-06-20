import type { GameRepository } from "../../domain/game.repository";
import { toGameDto } from "../dtos/game.dto";

type Input = {
  gameRepository: GameRepository;
};

export async function listGamesUseCase(input: Input) {
  const games = await input.gameRepository.findMany();

  return games.map(toGameDto);
}
