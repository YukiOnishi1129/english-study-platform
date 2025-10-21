import { redirect } from "next/navigation";
import { checkAuthAndRefresh } from "@/features/auth/servers/auth-check.server";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAuthAndRefresh();

  // If authenticated with valid token, redirect to dashboard
  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
