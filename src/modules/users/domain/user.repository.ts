import type { NewUser, User } from "./user.entity";

export interface UserRepository {
  findMany(): Promise<User[]>;
  create(data: NewUser): Promise<User>;
}
