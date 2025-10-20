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
