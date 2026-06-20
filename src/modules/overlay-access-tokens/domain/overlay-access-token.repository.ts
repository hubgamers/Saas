import type { NewOverlayAccessToken, OverlayAccessToken } from "./overlay-access-token.entity";

export interface OverlayAccessTokenRepository {
  findMany(): Promise<OverlayAccessToken[]>;
  create(data: NewOverlayAccessToken): Promise<OverlayAccessToken>;
}
