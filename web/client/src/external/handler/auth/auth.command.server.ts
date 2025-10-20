import "server-only";
import { cookies } from "next/headers";
import { mapAccountToFeature } from "@/external/mapper/account.mapper";
import {
  AccountService,
  type CreateAccountInput,
} from "@/external/service/account/account.service";
import { TokenVerificationService } from "@/external/service/auth/token-verification.service";
import type { Account } from "@/features/account/types/account";
import { updateIdTokenCookie } from "@/features/auth/servers/cookie.server";

const accountService = new AccountService();
const tokenVerificationService = new TokenVerificationService();

export async function createOrGetAccount(
  provider: string,
  providerAccountId: string,
  createInput: CreateAccountInput,
): Promise<Account> {
  const domainAccount = await accountService.createOrGet(
    provider,
    providerAccountId,
    createInput,
  );
  return mapAccountToFeature(domainAccount);
}

/**
 * Use refresh token to update tokens
 * Call periodically to keep tokens fresh
 */
export async function refreshAuthTokens(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token");

  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }

  try {
    const newTokens = await tokenVerificationService.refreshTokens(
      refreshToken.value,
    );

    // Update ID token cookie
    if (newTokens.idToken) {
      await updateIdTokenCookie(newTokens.idToken);
    }
  } catch (error) {
    console.error("Failed to refresh tokens:", error);
    throw error;
  }
}
