import { OAuth2Client } from "google-auth-library";

// シングルトンパターンでOAuth2Clientを管理
const globalForGoogleAuth = globalThis as unknown as {
  googleAuthClient: OAuth2Client | undefined;
};

export const googleAuthClient =
  globalForGoogleAuth.googleAuthClient ??
  new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });

if (process.env.NODE_ENV !== "production") {
  globalForGoogleAuth.googleAuthClient = googleAuthClient;
}
