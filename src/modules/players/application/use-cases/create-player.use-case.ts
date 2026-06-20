import type { PlayerRepository } from "../../domain/player.repository";
import { assertCanCreatePlayer } from "../../domain/player.rules";
import { toPlayerDto } from "../dtos/player.dto";

type Input = {
  teamId: string; // @relation(Team)
  userId: string; // @relation(User)
  nickname: string;
  playerRepository: PlayerRepository;
};

export async function createPlayerUseCase(input: Input) {
  assertCanCreatePlayer();

  const player = await input.playerRepository.create({
    teamId: input.teamId,
    userId: input.userId,
    nickname: input.nickname,
  });

  return toPlayerDto(player);
}
