import { redirect } from "next/navigation";
import { checkAuthAndRefresh } from "@/features/auth/servers/auth-check.server";

export default async function Home() {
  const isAuthenticated = await checkAuthAndRefresh();

  if (isAuthenticated) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
