import type { BroadcastRepository } from "../../domain/broadcast.repository";
import { toBroadcastDto } from "../dtos/broadcast.dto";

type Input = {
  broadcastRepository: BroadcastRepository;
};

export async function listBroadcastsUseCase(input: Input) {
  const broadcasts = await input.broadcastRepository.findMany();

  return broadcasts.map(toBroadcastDto);
}
