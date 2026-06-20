import { listMatchUseCase } from "../application/use-cases/list-match.use-case";
import { prismaMatchRepository } from "../infrastructure/prisma-match.repository";

export async function getMatch() {
  return listMatchUseCase({
    matchRepository: prismaMatchRepository,
  });
}
