import type { MatchRepository } from "../../domain/match.repository";
import { toMatchDto } from "../dtos/match.dto";

type Input = {
  matchRepository: MatchRepository;
};

export async function listMatchUseCase(input: Input) {
  const match = await input.matchRepository.findMany();

  return match.map(toMatchDto);
}
