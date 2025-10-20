import "server-only";
import { cookies } from "next/headers";
import type { TokenPayloadOutput } from "@/external/dto/auth/types";
import { TokenVerificationService } from "@/external/service/auth/token-verification.service";

const tokenVerificationService = new TokenVerificationService();

/**
 * IDトークンを検証し、ペイロードを返す
 * server関数の認証チェックで使用
 */
export async function verifyIdToken(): Promise<TokenPayloadOutput> {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token");

  if (!idToken) {
    throw new Error("ID token not found");
  }

  return await tokenVerificationService.verifyIdToken(idToken.value);
}

/**
 * 認証が必要なserver関数のラッパー
 * 使用例:
 * export const getProtectedData = withAuth(async (tokenPayload) => {
 *   // tokenPayloadには検証済みのユーザー情報が含まれる
 *   return await someService.getData(tokenPayload.userId);
 * });
 */
export function withAuth<T extends unknown[], R>(
  handler: (tokenPayload: TokenPayloadOutput, ...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    const tokenPayload = await verifyIdToken();
    return handler(tokenPayload, ...args);
  };
}
