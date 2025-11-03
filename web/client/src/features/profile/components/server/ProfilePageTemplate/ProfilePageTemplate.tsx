import { redirect } from "next/navigation";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";
import { ProfileContent } from "@/features/profile/components/client/ProfileContent";

export async function ProfilePageTemplate() {
  const account = await getAuthenticatedAccount();

  if (!account) {
    redirect("/login");
  }

  return <ProfileContent account={account} />;
}
