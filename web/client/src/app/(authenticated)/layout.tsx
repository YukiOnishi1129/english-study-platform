import { redirect } from "next/navigation";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";
import { AppShell } from "@/shared/components/layout/client/AppShell";

export default async function AuthenticatedLayout(props: LayoutProps<"/">) {
  const account = await getAuthenticatedAccount();

  if (!account) {
    redirect("/login");
  }

  return <AppShell account={account}>{props.children}</AppShell>;
}
