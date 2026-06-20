import type { NewOverlayScene, OverlayScene } from "./overlay-scene.entity";

export interface OverlaySceneRepository {
  findMany(): Promise<OverlayScene[]>;
  create(data: NewOverlayScene): Promise<OverlayScene>;
}
