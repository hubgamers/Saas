import type { TournamentRepository } from "../../domain/tournament.repository";
import { toTournamentDto } from "../dtos/tournament.dto";

type Input = {
  tournamentRepository: TournamentRepository;
};

export async function listTournamentsUseCase(input: Input) {
  const tournaments = await input.tournamentRepository.findMany();

  return tournaments.map(toTournamentDto);
}
