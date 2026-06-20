import type { OverlayThemeRepository } from "../../domain/overlay-theme.repository";
import { toOverlayThemeDto } from "../dtos/overlay-theme.dto";

type Input = {
  overlayThemeRepository: OverlayThemeRepository;
};

export async function listOverlayThemesUseCase(input: Input) {
  const overlayThemes = await input.overlayThemeRepository.findMany();

  return overlayThemes.map(toOverlayThemeDto);
}
