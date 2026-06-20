import type { OverlayDataSourceRepository } from "../../domain/overlay-data-source.repository";
import type { OverlayDataSourceType } from "../../domain/overlay-data-source.entity";
import { assertCanCreateOverlayDataSource } from "../../domain/overlay-data-source.rules";
import { toOverlayDataSourceDto } from "../dtos/overlay-data-source.dto";

type Input = {
  sceneId: string; // @relation(OverlayScene)
  name: string;
  type: OverlayDataSourceType;
  endpointUrl: string;
  refreshIntervalSeconds: number;
  payloadMappingJson?: string;
  isEnabled: boolean;
  overlayDataSourceRepository: OverlayDataSourceRepository;
};

export async function createOverlayDataSourceUseCase(input: Input) {
  assertCanCreateOverlayDataSource();

  const overlayDataSource = await input.overlayDataSourceRepository.create({
    sceneId: input.sceneId,
    name: input.name,
    type: input.type,
    endpointUrl: input.endpointUrl,
    refreshIntervalSeconds: input.refreshIntervalSeconds,
    payloadMappingJson: input.payloadMappingJson,
    isEnabled: input.isEnabled,
  });

  return toOverlayDataSourceDto(overlayDataSource);
}
