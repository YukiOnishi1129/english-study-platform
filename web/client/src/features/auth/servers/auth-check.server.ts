import "server-only";
import { getServerSession } from "next-auth";
import type { Account } from "@/features/account/types/account";
import { authOptions } from "@/features/auth/lib/options";

export async function getAuthenticatedAccount(): Promise<Account | null> {
  const session = await getServerSession(authOptions);
  if (!session?.account || session.error) {
    return null;
  }

  return session.account;
}

export async function checkAuthAndRefresh(): Promise<boolean> {
  const account = await getAuthenticatedAccount();
  return Boolean(account);
}
