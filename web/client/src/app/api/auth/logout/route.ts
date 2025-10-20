import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/features/auth/servers/cookie.server";

export async function POST() {
  // Clear all auth cookies
  await clearAuthCookies();

  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL),
  );
}
