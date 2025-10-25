import { LogoutButton } from "@/features/auth/components/client/LogoutButton";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";

export async function DashboardPageTemplate() {
  const account = await getAuthenticatedAccount();

  if (!account) {
    throw new Error("Authentication error: No account found");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-lg">
          Welcome, {account.firstName} {account.lastName}!
        </p>
        <p className="text-gray-600">Email: {account.email}</p>
        <p className="text-gray-600">Role: {account.role}</p>
        <div className="mt-4 w-48">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
