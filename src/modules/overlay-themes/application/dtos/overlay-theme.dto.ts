export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { OverlayTheme } from "../../domain/overlay-theme.entity";

export type OverlayThemeDto = {
  id: string;
  organizationId: string;
  organization?: RelationReferenceDto;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily?: string;
  logoUrl?: string;
  backgroundUrl?: string;
  createdAt: string;
};

export function toOverlayThemeDto(overlayTheme: OverlayTheme): OverlayThemeDto {
  return {
    id: overlayTheme.id,
    organizationId: overlayTheme.organizationId,
    organization: overlayTheme.organization,
    name: overlayTheme.name,
    primaryColor: overlayTheme.primaryColor,
    secondaryColor: overlayTheme.secondaryColor,
    accentColor: overlayTheme.accentColor,
    fontFamily: overlayTheme.fontFamily,
    logoUrl: overlayTheme.logoUrl,
    backgroundUrl: overlayTheme.backgroundUrl,
    createdAt: overlayTheme.createdAt.toISOString(),
  };
}
