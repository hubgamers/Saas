import type { User } from "../../domain/user.entity";

export type UserDto = {
  id: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
};

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    username: user.username,
    passwordHash: user.passwordHash,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}
