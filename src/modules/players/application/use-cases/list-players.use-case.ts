import type { PlayerRepository } from "../../domain/player.repository";
import { toPlayerDto } from "../dtos/player.dto";

type Input = {
  playerRepository: PlayerRepository;
};

export async function listPlayersUseCase(input: Input) {
  const players = await input.playerRepository.findMany();

  return players.map(toPlayerDto);
}
