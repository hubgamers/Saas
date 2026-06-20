import type { UserRepository } from "../../domain/user.repository";
import { assertCanCreateUser } from "../../domain/user.rules";
import { toUserDto } from "../dtos/user.dto";

type Input = {
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  userRepository: UserRepository;
};

export async function createUserUseCase(input: Input) {
  assertCanCreateUser();

  const user = await input.userRepository.create({
    username: input.username,
    passwordHash: input.passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    avatarUrl: input.avatarUrl,
  });

  return toUserDto(user);
}
