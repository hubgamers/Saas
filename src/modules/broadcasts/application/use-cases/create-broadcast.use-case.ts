import type { BroadcastRepository } from "../../domain/broadcast.repository";
import type { BroadcastPlatform, BroadcastStatus } from "../../domain/broadcast.entity";
import { assertCanCreateBroadcast } from "../../domain/broadcast.rules";
import { toBroadcastDto } from "../dtos/broadcast.dto";

type Input = {
  eventId: string; // @relation(Event)
  tournamentId?: string; // @relation(Tournament)
  platform: BroadcastPlatform;
  channelName: string;
  streamUrl: string;
  status: BroadcastStatus;
  recordingUrl?: string;
  startedAt?: Date;
  endedAt?: Date;
  delaySeconds?: number;
  broadcastRepository: BroadcastRepository;
};

export async function createBroadcastUseCase(input: Input) {
  assertCanCreateBroadcast();

  const broadcast = await input.broadcastRepository.create({
    eventId: input.eventId,
    tournamentId: input.tournamentId,
    platform: input.platform,
    channelName: input.channelName,
    streamUrl: input.streamUrl,
    status: input.status,
    recordingUrl: input.recordingUrl,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    delaySeconds: input.delaySeconds,
  });

  return toBroadcastDto(broadcast);
}
