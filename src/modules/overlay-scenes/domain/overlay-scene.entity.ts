export type RelationReference = {
  id: string;
  label?: string;
};

export const OverlaySceneKindValues = ["STARTING_SOON", "SCOREBOARD", "BRACKET", "STANDINGS", "LOWER_THIRD", "INTERMISSION", "ENDING", "CUSTOM"] as const;
export type OverlaySceneKind = (typeof OverlaySceneKindValues)[number];

export const OverlaySceneStatusValues = ["DRAFT", "READY", "LIVE", "ARCHIVED"] as const;
export type OverlaySceneStatus = (typeof OverlaySceneStatusValues)[number];

export type OverlayScene = {
  id: string;
  broadcastId: string;
  broadcast?: RelationReference;
  themeId?: string;
  theme?: RelationReference;
  name: string;
  kind: OverlaySceneKind;
  status: OverlaySceneStatus;
  isActive: boolean;
  configJson?: string;
  customCss?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewOverlayScene = {
  broadcastId: string; // @relation(Broadcast)
  themeId?: string; // @relation(OverlayTheme)
  name: string;
  kind: OverlaySceneKind;
  status: OverlaySceneStatus;
  isActive: boolean;
  configJson?: string;
  customCss?: string;
};
