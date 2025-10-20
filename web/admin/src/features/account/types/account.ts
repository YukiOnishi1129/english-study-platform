export interface Account {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  provider: string;
  providerAccountId: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}
