import { redirect } from "next/navigation";
import { checkAuthAndRefresh } from "@/features/auth/servers/auth-check.server";

export default async function AuthenticatedLayout(props: LayoutProps<"/">) {
  const isAuthenticated = await checkAuthAndRefresh();

  // If not authenticated or token refresh failed, redirect to login
  if (!isAuthenticated) {
    redirect("/login");
  }

  return <>{props.children}</>;
}
