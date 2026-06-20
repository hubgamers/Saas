import type { OverlaySceneRepository } from "../domain/overlay-scene.repository";

export const prismaOverlaySceneRepository: OverlaySceneRepository = {
  findMany() {
    throw new Error("Implement prismaOverlaySceneRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaOverlaySceneRepository.create after adding the Prisma model.");
  },
};
