import type { TournamentPhaseRepository } from "../../domain/tournament-phase.repository";
import { toTournamentPhaseDto } from "../dtos/tournament-phase.dto";

type Input = {
  tournamentPhaseRepository: TournamentPhaseRepository;
};

export async function listTournamentPhaseUseCase(input: Input) {
  const tournamentPhase = await input.tournamentPhaseRepository.findMany();

  return tournamentPhase.map(toTournamentPhaseDto);
}
