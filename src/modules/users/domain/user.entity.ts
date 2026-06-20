export type User = {
  id: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewUser = {
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
};
