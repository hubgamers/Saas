export type RelationReference = {
  id: string;
  label?: string;
};

export const OverlayDataSourceTypeValues = ["MATCH", "BRACKET", "STANDINGS", "CUSTOM"] as const;
export type OverlayDataSourceType = (typeof OverlayDataSourceTypeValues)[number];

export type OverlayDataSource = {
  id: string;
  sceneId: string;
  scene?: RelationReference;
  name: string;
  type: OverlayDataSourceType;
  endpointUrl: string;
  refreshIntervalSeconds: number;
  payloadMappingJson?: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NewOverlayDataSource = {
  sceneId: string; // @relation(OverlayScene)
  name: string;
  type: OverlayDataSourceType;
  endpointUrl: string;
  refreshIntervalSeconds: number;
  payloadMappingJson?: string;
  isEnabled: boolean;
};
