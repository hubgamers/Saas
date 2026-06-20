import type { OverlaySceneRepository } from "../../domain/overlay-scene.repository";
import { toOverlaySceneDto } from "../dtos/overlay-scene.dto";

type Input = {
  overlaySceneRepository: OverlaySceneRepository;
};

export async function listOverlayScenesUseCase(input: Input) {
  const overlayScenes = await input.overlaySceneRepository.findMany();

  return overlayScenes.map(toOverlaySceneDto);
}
