import "server-only";
import { cookies } from "next/headers";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(idToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  // Set ID token (1 hour)
  cookieStore.set("id_token", idToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60, // 1 hour
  });

  // Set refresh token (30 days)
  cookieStore.set("refresh_token", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete("id_token");
  cookieStore.delete("refresh_token");
}

export async function updateIdTokenCookie(idToken: string) {
  const cookieStore = await cookies();

  cookieStore.set("id_token", idToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60, // 1 hour
  });
}
