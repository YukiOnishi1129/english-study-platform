export interface Account {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: "admin" | "user";
  provider: string;
  providerAccountId: string;
  thumbnail?: string;
  isAdmin: boolean;
  canAccessAdminPanel: boolean;
  createdAt: Date;
  updatedAt: Date;
}
