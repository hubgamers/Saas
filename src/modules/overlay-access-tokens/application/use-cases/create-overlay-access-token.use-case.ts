import type { OverlayAccessTokenRepository } from "../../domain/overlay-access-token.repository";
import { assertCanCreateOverlayAccessToken } from "../../domain/overlay-access-token.rules";
import { toOverlayAccessTokenDto } from "../dtos/overlay-access-token.dto";

type Input = {
  sceneId: string; // @relation(OverlayScene)
  label: string;
  tokenHash: string;
  expiresAt?: Date;
  revokedAt?: Date;
  lastUsedAt: Date;
  overlayAccessTokenRepository: OverlayAccessTokenRepository;
};

export async function createOverlayAccessTokenUseCase(input: Input) {
  assertCanCreateOverlayAccessToken();

  const overlayAccessToken = await input.overlayAccessTokenRepository.create({
    sceneId: input.sceneId,
    label: input.label,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    revokedAt: input.revokedAt,
    lastUsedAt: input.lastUsedAt,
  });

  return toOverlayAccessTokenDto(overlayAccessToken);
}
