import "server-only";
import { cookies } from "next/headers";
import { mapAccountToFeature } from "@/external/mapper/account.mapper";
import { AccountService } from "@/external/service/account/account.service";
import { TokenVerificationService } from "@/external/service/auth/token-verification.service";
import type { Account } from "@/features/account/types/account";

const tokenVerificationService = new TokenVerificationService();

export async function verifyIdToken(): Promise<Account | null> {
  try {
    const cookieStore = await cookies();
    const idToken = cookieStore.get("id_token")?.value;

    if (!idToken) {
      return null;
    }

    const payload = await tokenVerificationService.verifyIdToken(idToken);
    if (!payload || !payload.isValid) {
      return null;
    }

    // Get account from database using the user ID from token
    const accountService = new AccountService();
    const domainAccount = await accountService.findByProvider(
      "google",
      payload.userId,
    );

    return domainAccount ? mapAccountToFeature(domainAccount) : null;
  } catch (error) {
    console.error("Failed to verify token:", error);
    return null;
  }
}

export function withAuth<T extends unknown[], R>(
  fn: (account: Account, ...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    const account = await verifyIdToken();
    if (!account) {
      throw new Error("Unauthorized");
    }
    return fn(account, ...args);
  };
}
