import { redirect } from "next/navigation";
import { verifyIdToken } from "@/external/handler/auth/auth-check.server";

export default async function DashboardPage() {
  const account = await verifyIdToken();

  if (!account) {
    redirect("/login");
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

        <form action="/api/auth/logout" method="POST" className="mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
