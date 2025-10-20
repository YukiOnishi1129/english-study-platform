import { NextResponse } from "next/server";
import { getGoogleOAuth2Client } from "@/external/client/google-auth/client";

export async function GET() {
  const client = getGoogleOAuth2Client();

  const authorizeUrl = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
  });

  return NextResponse.redirect(authorizeUrl);
}
