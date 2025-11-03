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
  createdAt: Date;
  updatedAt: Date;
}
