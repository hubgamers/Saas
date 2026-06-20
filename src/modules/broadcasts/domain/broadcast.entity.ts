export type RelationReference = {
  id: string;
  label?: string;
};

export const BroadcastPlatformValues = ["TWITCH", "YOUTUBE", "KICK", "CUSTOM"] as const;
export type BroadcastPlatform = (typeof BroadcastPlatformValues)[number];

export const BroadcastStatusValues = ["PLANNED", "LIVE", "ENDED", "CANCELLED"] as const;
export type BroadcastStatus = (typeof BroadcastStatusValues)[number];

export type Broadcast = {
  id: string;
  eventId: string;
  event?: RelationReference;
  tournamentId?: string;
  tournament?: RelationReference;
  platform: BroadcastPlatform;
  channelName: string;
  streamUrl: string;
  status: BroadcastStatus;
  recordingUrl?: string;
  startedAt?: Date;
  endedAt?: Date;
  delaySeconds?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type NewBroadcast = {
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
};
