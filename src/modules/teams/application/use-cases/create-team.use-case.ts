import type { TeamRepository } from "../../domain/team.repository";
import type { TeamStatus } from "../../domain/team.entity";
import { assertCanCreateTeam } from "../../domain/team.rules";
import { toTeamDto } from "../dtos/team.dto";

type Input = {
  name: string;
  logoUrl?: string;
  managerId: string; // @relation(User)
  status: TeamStatus;
  teamRepository: TeamRepository;
};

export async function createTeamUseCase(input: Input) {
  assertCanCreateTeam();

  const team = await input.teamRepository.create({
    name: input.name,
    logoUrl: input.logoUrl,
    managerId: input.managerId,
    status: input.status,
  });

  return toTeamDto(team);
}
