import { googleAuthClient } from "@/external/client/google-auth/client";

export interface TokenPayload {
  userId: string;
  email?: string | null;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  isValid: boolean;
}

export class TokenVerificationService {
  /**
   * Google IDトークンを検証してペイロードを返す
   */
  async verifyIdToken(idToken: string): Promise<TokenPayload> {
    try {
      const ticket = await googleAuthClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID || "",
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error("Invalid token payload");
      }

      return {
        userId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        name: payload.name,
        picture: payload.picture,
        isValid: true,
      };
    } catch (error) {
      console.error("Token verification failed:", error);
      throw new Error("Invalid ID token");
    }
  }

  /**
   * リフレッシュトークンを使用して新しいトークンを取得
   */
  async refreshTokens(refreshToken: string) {
    try {
      googleAuthClient.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await googleAuthClient.refreshAccessToken();

      return {
        accessToken: credentials.access_token,
        idToken: credentials.id_token,
        expiryDate: credentials.expiry_date,
      };
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw new Error("Failed to refresh tokens");
    }
  }
}
