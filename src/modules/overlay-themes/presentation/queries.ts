import { listOverlayThemesUseCase } from "../application/use-cases/list-overlay-themes.use-case";
import { prismaOverlayThemeRepository } from "../infrastructure/prisma-overlay-theme.repository";

export async function getOverlayThemes() {
  return listOverlayThemesUseCase({
    overlayThemeRepository: prismaOverlayThemeRepository,
  });
}
