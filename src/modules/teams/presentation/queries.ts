import { listTeamsUseCase } from "../application/use-cases/list-teams.use-case";
import { prismaTeamRepository } from "../infrastructure/prisma-team.repository";

export async function getTeams() {
  return listTeamsUseCase({
    teamRepository: prismaTeamRepository,
  });
}
