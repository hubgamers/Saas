import type { OverlayDataSourceRepository } from "../../domain/overlay-data-source.repository";
import { toOverlayDataSourceDto } from "../dtos/overlay-data-source.dto";

type Input = {
  overlayDataSourceRepository: OverlayDataSourceRepository;
};

export async function listOverlayDataSourcesUseCase(input: Input) {
  const overlayDataSources = await input.overlayDataSourceRepository.findMany();

  return overlayDataSources.map(toOverlayDataSourceDto);
}
