import "server-only";
import { TokenVerificationService } from "@/external/service/auth/token-verification.service";

const tokenVerificationService = new TokenVerificationService();

export interface RefreshedGoogleTokens {
  accessToken?: string | null;
  idToken?: string | null;
  accessTokenExpires?: number | null;
}

export async function refreshGoogleTokens(
  refreshToken: string,
): Promise<RefreshedGoogleTokens> {
  const refreshed = await tokenVerificationService.refreshTokens(refreshToken);

  return {
    accessToken: refreshed.accessToken ?? null,
    idToken: refreshed.idToken ?? null,
    accessTokenExpires: refreshed.expiryDate ?? null,
  };
}
