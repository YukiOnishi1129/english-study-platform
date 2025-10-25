import { redirect } from "next/navigation";
import { checkAuthAndRefresh } from "@/features/auth/servers/auth-check.server";

export async function AuthRedirectPageTemplate() {
  const isAuthenticated = await checkAuthAndRefresh();

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  redirect("/login");

  return <div />;
}
