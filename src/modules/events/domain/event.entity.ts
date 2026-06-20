export type RelationReference = {
  id: string;
  label?: string;
};

export const EventTypeValues = ["ONLINE", "LAN", "HYBRID"] as const;
export type EventType = (typeof EventTypeValues)[number];

export const EventStatusValues = ["DRAFT", "PUBLISHED", "LIVE", "COMPLETED", "CANCELLED"] as const;
export type EventStatus = (typeof EventStatusValues)[number];

export type Event = {
  id: string;
  organizationId: string;
  organization?: RelationReference;
  name: string;
  slug: string;
  description?: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  venueName?: string;
  venueAddress?: string;
  bannerUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewEvent = {
  organizationId: string; // @relation(Organization)
  name: string;
  slug: string;
  description?: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  venueName?: string;
  venueAddress?: string;
  bannerUrl?: string;
};
