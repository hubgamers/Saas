import { listPlayersUseCase } from "../application/use-cases/list-players.use-case";
import { prismaPlayerRepository } from "../infrastructure/prisma-player.repository";

export async function getPlayers() {
  return listPlayersUseCase({
    playerRepository: prismaPlayerRepository,
  });
}
