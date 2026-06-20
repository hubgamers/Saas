import { listOverlayDataSourcesUseCase } from "../application/use-cases/list-overlay-data-sources.use-case";
import { prismaOverlayDataSourceRepository } from "../infrastructure/prisma-overlay-data-source.repository";

export async function getOverlayDataSources() {
  return listOverlayDataSourcesUseCase({
    overlayDataSourceRepository: prismaOverlayDataSourceRepository,
  });
}
