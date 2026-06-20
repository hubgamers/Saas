import type { NewOverlayDataSource, OverlayDataSource } from "./overlay-data-source.entity";

export interface OverlayDataSourceRepository {
  findMany(): Promise<OverlayDataSource[]>;
  create(data: NewOverlayDataSource): Promise<OverlayDataSource>;
}
