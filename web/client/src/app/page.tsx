import { redirect } from "next/navigation";

import { checkAuthAndRefresh } from "@/features/auth/servers/auth-check.server";
import { LandingPageTemplate } from "@/features/landing/components/server/LandingPageTemplate";

export const dynamic = "force-dynamic";

export default async function Home(_: PageProps<"/">) {
  const isAuthenticated = await checkAuthAndRefresh();
  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return <LandingPageTemplate />;
}
