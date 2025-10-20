import type { Account } from "@/features/account/types/account";

declare module "next-auth" {
  interface Session {
    account?: Account;
  }

  interface User {
    id: string;
    account?: Account;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    account?: Account;
  }
}

// Google OAuth profile type
export interface GoogleProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  email: string;
  email_verified: boolean;
  locale?: string;
}
