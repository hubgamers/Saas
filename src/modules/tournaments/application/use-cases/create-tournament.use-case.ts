import type { TournamentRepository } from "../../domain/tournament.repository";
import type { TournamentFormat, TournamentStatus } from "../../domain/tournament.entity";
import { assertCanCreateTournament } from "../../domain/tournament.rules";
import { toTournamentDto } from "../dtos/tournament.dto";

type Input = {
  name: string;
  gameId: string; // @relation(Game)
  organizationId: string; // @relation(Organization)
  description?: string;
  format: TournamentFormat;
  maxTeams: number;
  maxPlayerPerTeam: number;
  registrationStart: Date;
  registrationEnd: Date;
  startDate: Date;
  endDate: Date;
  status: TournamentStatus;
  bannerUrl?: string;
  rules?: string;
  prizePool?: string;
  tournamentRepository: TournamentRepository;
};

export async function createTournamentUseCase(input: Input) {
  assertCanCreateTournament();

  const tournament = await input.tournamentRepository.create({
    name: input.name,
    gameId: input.gameId,
    organizationId: input.organizationId,
    description: input.description,
    format: input.format,
    maxTeams: input.maxTeams,
    maxPlayerPerTeam: input.maxPlayerPerTeam,
    registrationStart: input.registrationStart,
    registrationEnd: input.registrationEnd,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status,
    bannerUrl: input.bannerUrl,
    rules: input.rules,
    prizePool: input.prizePool,
  });

  return toTournamentDto(tournament);
}
