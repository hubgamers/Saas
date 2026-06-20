import type { NewOverlayTheme, OverlayTheme } from "./overlay-theme.entity";

export interface OverlayThemeRepository {
  findMany(): Promise<OverlayTheme[]>;
  create(data: NewOverlayTheme): Promise<OverlayTheme>;
}
