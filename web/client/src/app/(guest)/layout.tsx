import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token");

  // If authenticated, redirect to dashboard
  if (idToken) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
