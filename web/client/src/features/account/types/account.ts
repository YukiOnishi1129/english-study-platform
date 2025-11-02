export interface Account {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: "admin" | "user";
  isActive: boolean;
  lastLoginAt: Date | null;
  provider: string;
  providerAccountId: string;
  thumbnail?: string;
  isAdmin: boolean;
  canAccessAdminPanel: boolean;
  createdAt: Date;
  updatedAt: Date;
}
