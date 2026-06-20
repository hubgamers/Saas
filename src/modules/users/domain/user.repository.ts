import type { NewUser, User } from "./user.entity";

export interface UserRepository {
  findMany(): Promise<User[]>;
  create(data: NewUser): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  validateUserCredentials(email: string, password: string): Promise<User | null>;
}
