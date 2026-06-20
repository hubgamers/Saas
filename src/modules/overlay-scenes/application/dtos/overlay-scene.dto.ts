export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { OverlayScene, OverlaySceneKind, OverlaySceneStatus } from "../../domain/overlay-scene.entity";

export type OverlaySceneDto = {
  id: string;
  broadcastId: string;
  broadcast?: RelationReferenceDto;
  themeId?: string;
  theme?: RelationReferenceDto;
  name: string;
  kind: OverlaySceneKind;
  status: OverlaySceneStatus;
  isActive: boolean;
  configJson?: string;
  customCss?: string;
  createdAt: string;
};

export function toOverlaySceneDto(overlayScene: OverlayScene): OverlaySceneDto {
  return {
    id: overlayScene.id,
    broadcastId: overlayScene.broadcastId,
    broadcast: overlayScene.broadcast,
    themeId: overlayScene.themeId,
    theme: overlayScene.theme,
    name: overlayScene.name,
    kind: overlayScene.kind,
    status: overlayScene.status,
    isActive: overlayScene.isActive,
    configJson: overlayScene.configJson,
    customCss: overlayScene.customCss,
    createdAt: overlayScene.createdAt.toISOString(),
  };
}
