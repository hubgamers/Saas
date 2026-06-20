import { listUsersUseCase } from "../application/use-cases/list-users.use-case";
import { prismaUserRepository } from "../infrastructure/prisma-user.repository";

export async function getUsers() {
  return listUsersUseCase({
    userRepository: prismaUserRepository,
  });
}
