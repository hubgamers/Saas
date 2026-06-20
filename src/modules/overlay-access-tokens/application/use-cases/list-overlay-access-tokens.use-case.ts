import type { OverlayAccessTokenRepository } from "../../domain/overlay-access-token.repository";
import { toOverlayAccessTokenDto } from "../dtos/overlay-access-token.dto";

type Input = {
  overlayAccessTokenRepository: OverlayAccessTokenRepository;
};

export async function listOverlayAccessTokensUseCase(input: Input) {
  const overlayAccessTokens = await input.overlayAccessTokenRepository.findMany();

  return overlayAccessTokens.map(toOverlayAccessTokenDto);
}
