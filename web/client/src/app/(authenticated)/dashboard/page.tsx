import { LogoutButton } from "@/features/auth/components/client/LogoutButton";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";

export default async function DashboardPage() {
  const account = await getAuthenticatedAccount();

  // Account should always exist here due to layout authentication check
  if (!account) {
    throw new Error("Authentication error: No account found");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
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
