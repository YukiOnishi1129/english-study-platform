import "server-only";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Account } from "@/features/account/types/account";
import { authOptions } from "@/features/auth/lib/options";

export async function getAuthenticatedAdmin(): Promise<Account | null> {
  const session = await getServerSession(authOptions);
  if (!session?.account || session.account.role !== "admin" || session.error) {
    return null;
  }

  return session.account;
}

export async function requireAdmin(): Promise<Account> {
  const account = await getAuthenticatedAdmin();
  if (!account) {
    redirect("/login");
  }

  return account;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const account = await getAuthenticatedAdmin();
  return Boolean(account);
}
