import "server-only";
import { cookies } from "next/headers";
import { refreshAuthTokens } from "@/external/handler/auth/auth.command.server";
import { verifyIdToken } from "@/external/handler/auth/auth-check.server";

export async function checkAuthAndRefresh(): Promise<boolean> {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // No tokens at all
  if (!idToken || !refreshToken) {
    return false;
  }

  // Try to verify the ID token
  const account = await verifyIdToken();
  if (account) {
    return true;
  }

  // ID token is invalid or expired, try to refresh
  try {
    await refreshAuthTokens();
    return true;
  } catch (error) {
    // Refresh failed, user needs to login again
    console.error("Token refresh failed:", error);
    return false;
  }
}
