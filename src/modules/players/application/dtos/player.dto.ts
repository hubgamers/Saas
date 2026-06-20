export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { Player } from "../../domain/player.entity";

export type PlayerDto = {
  id: string;
  teamId: string;
  team?: RelationReferenceDto;
  userId: string;
  user?: RelationReferenceDto;
  nickname: string;
  createdAt: string;
};

export function toPlayerDto(player: Player): PlayerDto {
  return {
    id: player.id,
    teamId: player.teamId,
    team: player.team,
    userId: player.userId,
    user: player.user,
    nickname: player.nickname,
    createdAt: player.createdAt.toISOString(),
  };
}
