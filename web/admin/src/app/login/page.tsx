import { redirect } from "next/navigation";
import { LoginPageTemplate } from "@/features/auth/components/server/LoginPageTemplate";
import { isAdminAuthenticated } from "@/features/auth/servers/auth-check.server";

export default async function LoginPage() {
  const isAuthenticated = await isAdminAuthenticated();

  if (isAuthenticated) {
    redirect("/");
  }

  return <LoginPageTemplate />;
}
