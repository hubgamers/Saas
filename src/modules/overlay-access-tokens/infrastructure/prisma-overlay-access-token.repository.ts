import type { OverlayAccessTokenRepository } from "../domain/overlay-access-token.repository";

export const prismaOverlayAccessTokenRepository: OverlayAccessTokenRepository = {
  findMany() {
    throw new Error("Implement prismaOverlayAccessTokenRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaOverlayAccessTokenRepository.create after adding the Prisma model.");
  },
};
