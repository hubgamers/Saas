import type { OverlayThemeRepository } from "../domain/overlay-theme.repository";

export const prismaOverlayThemeRepository: OverlayThemeRepository = {
  findMany() {
    throw new Error("Implement prismaOverlayThemeRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaOverlayThemeRepository.create after adding the Prisma model.");
  },
};
