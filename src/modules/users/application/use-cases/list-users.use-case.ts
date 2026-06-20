import type { UserRepository } from "../../domain/user.repository";
import { toUserDto } from "../dtos/user.dto";

type Input = {
  userRepository: UserRepository;
};

export async function listUsersUseCase(input: Input) {
  const users = await input.userRepository.findMany();

  return users.map(toUserDto);
}
