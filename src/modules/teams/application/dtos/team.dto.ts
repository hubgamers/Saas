export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { Team, TeamStatus } from "../../domain/team.entity";

export type TeamDto = {
  id: string;
  name: string;
  logoUrl?: string;
  managerId: string;
  manager?: RelationReferenceDto;
  status: TeamStatus;
  createdAt: string;
};

export function toTeamDto(team: Team): TeamDto {
  return {
    id: team.id,
    name: team.name,
    logoUrl: team.logoUrl,
    managerId: team.managerId,
    manager: team.manager,
    status: team.status,
    createdAt: team.createdAt.toISOString(),
  };
}
