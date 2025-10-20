import { type NextRequest, NextResponse } from "next/server";
import { getGoogleOAuth2Client } from "@/external/client/google-auth/client";
import { createOrGetAccount } from "@/external/handler/auth/auth.command.server";
import { setAuthCookies } from "@/features/auth/servers/cookie.server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    const client = getGoogleOAuth2Client();
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        new URL("/login?error=missing_tokens", request.url),
      );
    }

    // Verify ID token
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return NextResponse.redirect(
        new URL("/login?error=missing_config", request.url),
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", request.url),
      );
    }

    // Create or get account
    const _account = await createOrGetAccount("google", payload.sub, {
      email: payload.email,
      name: payload.name,
      provider: "google",
      providerAccountId: payload.sub,
      thumbnail: payload.picture,
    });

    // Set auth cookies
    await setAuthCookies(tokens.id_token, tokens.refresh_token);

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url),
    );
  }
}
