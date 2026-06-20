export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { Broadcast, BroadcastPlatform, BroadcastStatus } from "../../domain/broadcast.entity";

export type BroadcastDto = {
  id: string;
  eventId: string;
  event?: RelationReferenceDto;
  tournamentId?: string;
  tournament?: RelationReferenceDto;
  platform: BroadcastPlatform;
  channelName: string;
  streamUrl: string;
  status: BroadcastStatus;
  recordingUrl?: string;
  startedAt?: string;
  endedAt?: string;
  delaySeconds?: number;
  createdAt: string;
};

export function toBroadcastDto(broadcast: Broadcast): BroadcastDto {
  return {
    id: broadcast.id,
    eventId: broadcast.eventId,
    event: broadcast.event,
    tournamentId: broadcast.tournamentId,
    tournament: broadcast.tournament,
    platform: broadcast.platform,
    channelName: broadcast.channelName,
    streamUrl: broadcast.streamUrl,
    status: broadcast.status,
    recordingUrl: broadcast.recordingUrl,
    startedAt: broadcast.startedAt?.toISOString(),
    endedAt: broadcast.endedAt?.toISOString(),
    delaySeconds: broadcast.delaySeconds,
    createdAt: broadcast.createdAt.toISOString(),
  };
}
