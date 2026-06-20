import { listBroadcastsUseCase } from "../application/use-cases/list-broadcasts.use-case";
import { prismaBroadcastRepository } from "../infrastructure/prisma-broadcast.repository";

export async function getBroadcasts() {
  return listBroadcastsUseCase({
    broadcastRepository: prismaBroadcastRepository,
  });
}
