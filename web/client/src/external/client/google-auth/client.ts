import { OAuth2Client } from "google-auth-library";

let oAuth2Client: OAuth2Client | null = null;

export const getGoogleOAuth2Client = () => {
  if (!oAuth2Client) {
    oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    );
  }
  return oAuth2Client;
};
