import { listOverlayScenesUseCase } from "../application/use-cases/list-overlay-scenes.use-case";
import { prismaOverlaySceneRepository } from "../infrastructure/prisma-overlay-scene.repository";

export async function getOverlayScenes() {
  return listOverlayScenesUseCase({
    overlaySceneRepository: prismaOverlaySceneRepository,
  });
}
