export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { OverlayDataSource, OverlayDataSourceType } from "../../domain/overlay-data-source.entity";

export type OverlayDataSourceDto = {
  id: string;
  sceneId: string;
  scene?: RelationReferenceDto;
  name: string;
  type: OverlayDataSourceType;
  endpointUrl: string;
  refreshIntervalSeconds: number;
  payloadMappingJson?: string;
  isEnabled: boolean;
  createdAt: string;
};

export function toOverlayDataSourceDto(overlayDataSource: OverlayDataSource): OverlayDataSourceDto {
  return {
    id: overlayDataSource.id,
    sceneId: overlayDataSource.sceneId,
    scene: overlayDataSource.scene,
    name: overlayDataSource.name,
    type: overlayDataSource.type,
    endpointUrl: overlayDataSource.endpointUrl,
    refreshIntervalSeconds: overlayDataSource.refreshIntervalSeconds,
    payloadMappingJson: overlayDataSource.payloadMappingJson,
    isEnabled: overlayDataSource.isEnabled,
    createdAt: overlayDataSource.createdAt.toISOString(),
  };
}
