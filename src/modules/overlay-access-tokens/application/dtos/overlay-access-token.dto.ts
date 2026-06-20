export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { OverlayAccessToken } from "../../domain/overlay-access-token.entity";

export type OverlayAccessTokenDto = {
  id: string;
  sceneId: string;
  scene?: RelationReferenceDto;
  label: string;
  tokenHash: string;
  expiresAt?: string;
  revokedAt?: string;
  lastUsedAt: string;
  createdAt: string;
};

export function toOverlayAccessTokenDto(overlayAccessToken: OverlayAccessToken): OverlayAccessTokenDto {
  return {
    id: overlayAccessToken.id,
    sceneId: overlayAccessToken.sceneId,
    scene: overlayAccessToken.scene,
    label: overlayAccessToken.label,
    tokenHash: overlayAccessToken.tokenHash,
    expiresAt: overlayAccessToken.expiresAt?.toISOString(),
    revokedAt: overlayAccessToken.revokedAt?.toISOString(),
    lastUsedAt: overlayAccessToken.lastUsedAt.toISOString(),
    createdAt: overlayAccessToken.createdAt.toISOString(),
  };
}
