import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token");

  // If not authenticated, redirect to login
  if (!idToken) {
    redirect("/login");
  }

  return <>{children}</>;
}
