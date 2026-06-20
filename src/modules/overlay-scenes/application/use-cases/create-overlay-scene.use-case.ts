import type { OverlaySceneRepository } from "../../domain/overlay-scene.repository";
import type { OverlaySceneKind, OverlaySceneStatus } from "../../domain/overlay-scene.entity";
import { assertCanCreateOverlayScene } from "../../domain/overlay-scene.rules";
import { toOverlaySceneDto } from "../dtos/overlay-scene.dto";

type Input = {
  broadcastId: string; // @relation(Broadcast)
  themeId?: string; // @relation(OverlayTheme)
  name: string;
  kind: OverlaySceneKind;
  status: OverlaySceneStatus;
  isActive: boolean;
  configJson?: string;
  customCss?: string;
  overlaySceneRepository: OverlaySceneRepository;
};

export async function createOverlaySceneUseCase(input: Input) {
  assertCanCreateOverlayScene();

  const overlayScene = await input.overlaySceneRepository.create({
    broadcastId: input.broadcastId,
    themeId: input.themeId,
    name: input.name,
    kind: input.kind,
    status: input.status,
    isActive: input.isActive,
    configJson: input.configJson,
    customCss: input.customCss,
  });

  return toOverlaySceneDto(overlayScene);
}
