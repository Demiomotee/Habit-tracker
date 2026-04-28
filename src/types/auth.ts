export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
};

export type Session = {
  userId: string;
  email: string;
  name: string;
};
