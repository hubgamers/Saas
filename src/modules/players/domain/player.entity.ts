export type RelationReference = {
  id: string;
  label?: string;
};

export type Player = {
  id: string;
  teamId: string;
  team?: RelationReference;
  userId: string;
  user?: RelationReference;
  nickname: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewPlayer = {
  teamId: string; // @relation(Team)
  userId: string; // @relation(User)
  nickname: string;
};
