import type { OverlayThemeRepository } from "../../domain/overlay-theme.repository";
import { assertCanCreateOverlayTheme } from "../../domain/overlay-theme.rules";
import { toOverlayThemeDto } from "../dtos/overlay-theme.dto";

type Input = {
  organizationId: string; // @relation(Organization)
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily?: string;
  logoUrl?: string;
  backgroundUrl?: string;
  overlayThemeRepository: OverlayThemeRepository;
};

export async function createOverlayThemeUseCase(input: Input) {
  assertCanCreateOverlayTheme();

  const overlayTheme = await input.overlayThemeRepository.create({
    organizationId: input.organizationId,
    name: input.name,
    primaryColor: input.primaryColor,
    secondaryColor: input.secondaryColor,
    accentColor: input.accentColor,
    fontFamily: input.fontFamily,
    logoUrl: input.logoUrl,
    backgroundUrl: input.backgroundUrl,
  });

  return toOverlayThemeDto(overlayTheme);
}
