import "server-only";
import { cookies } from "next/headers";
import type { Account } from "@/external/domain/entities/Account";
import {
  AccountService,
  type CreateAccountInput,
} from "@/external/service/account/account.service";
import { TokenVerificationService } from "@/external/service/auth/token-verification.service";

const accountService = new AccountService();
const tokenVerificationService = new TokenVerificationService();

export async function createOrGetAccount(
  provider: string,
  providerAccountId: string,
  createInput: CreateAccountInput,
): Promise<Account> {
  return await accountService.findOrCreateAccount(
    provider,
    providerAccountId,
    createInput,
  );
}

/**
 * リフレッシュトークンを使用してトークンを更新
 * 定期的に呼び出してトークンを最新に保つ
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

    // 新しいトークンをCookieに保存
    if (newTokens.idToken) {
      cookieStore.set("id_token", newTokens.idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7日間
      });
    }

    if (newTokens.accessToken) {
      cookieStore.set("access_token", newTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1時間
      });
    }
  } catch (error) {
    console.error("Failed to refresh tokens:", error);
    throw error;
  }
}
