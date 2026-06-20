export type Game = {
  id: string;
  name: string;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewGame = {
  name: string;
  platform: string;
};
