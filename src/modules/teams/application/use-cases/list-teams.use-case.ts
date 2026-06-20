import type { TeamRepository } from "../../domain/team.repository";
import { toTeamDto } from "../dtos/team.dto";

type Input = {
  teamRepository: TeamRepository;
};

export async function listTeamsUseCase(input: Input) {
  const teams = await input.teamRepository.findMany();

  return teams.map(toTeamDto);
}
