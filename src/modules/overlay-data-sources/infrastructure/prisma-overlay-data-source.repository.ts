import type { OverlayDataSourceRepository } from "../domain/overlay-data-source.repository";

export const prismaOverlayDataSourceRepository: OverlayDataSourceRepository = {
  findMany() {
    throw new Error("Implement prismaOverlayDataSourceRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaOverlayDataSourceRepository.create after adding the Prisma model.");
  },
};
