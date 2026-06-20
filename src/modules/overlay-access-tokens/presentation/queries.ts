import { listOverlayAccessTokensUseCase } from "../application/use-cases/list-overlay-access-tokens.use-case";
import { prismaOverlayAccessTokenRepository } from "../infrastructure/prisma-overlay-access-token.repository";

export async function getOverlayAccessTokens() {
  return listOverlayAccessTokensUseCase({
    overlayAccessTokenRepository: prismaOverlayAccessTokenRepository,
  });
}
