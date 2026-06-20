import { listGamesUseCase } from "../application/use-cases/list-games.use-case";
import { prismaGameRepository } from "../infrastructure/prisma-game.repository";

export async function getGames() {
  return listGamesUseCase({
    gameRepository: prismaGameRepository,
  });
}
