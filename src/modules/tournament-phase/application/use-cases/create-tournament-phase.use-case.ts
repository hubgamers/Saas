import type { TournamentPhaseRepository } from "../../domain/tournament-phase.repository";
import type { TournamentPhaseType, TournamentPhaseStatus } from "../../domain/tournament-phase.entity";
import { assertCanCreateTournamentPhase } from "../../domain/tournament-phase.rules";
import { toTournamentPhaseDto } from "../dtos/tournament-phase.dto";

type Input = {
  tournamentId: string; // @relation(Tournament)
  name: string;
  type: TournamentPhaseType;
  order: number;
  startsAt: Date;
  endsAt?: Date;
  status: TournamentPhaseStatus;
  tournamentPhaseRepository: TournamentPhaseRepository;
};

export async function createTournamentPhaseUseCase(input: Input) {
  assertCanCreateTournamentPhase();

  const tournamentPhase = await input.tournamentPhaseRepository.create({
    tournamentId: input.tournamentId,
    name: input.name,
    type: input.type,
    order: input.order,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    status: input.status,
  });

  return toTournamentPhaseDto(tournamentPhase);
}
