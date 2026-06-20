import type { NewRegistration, Registration } from "./registration.entity";

export interface RegistrationRepository {
  findMany(): Promise<Registration[]>;
  create(data: NewRegistration): Promise<Registration>;
}
