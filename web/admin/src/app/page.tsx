import { redirect } from "next/navigation";
import { LogoutButton } from "@/features/auth/components/client/LogoutButton";
import { getAuthenticatedAdmin } from "@/features/auth/servers/auth-check.server";

export default async function Home() {
  const account = await getAuthenticatedAdmin();

  if (!account) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">管理ダッシュボード</h1>
        <p className="mt-2 text-gray-600">
          {account.firstName} {account.lastName}（{account.email}）でログイン中
        </p>
      </header>
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Next steps</h2>
        <p className="mt-2 text-gray-600">
          管理画面の各機能をここから追加していきます。
        </p>
      </section>
      <div className="w-40">
        <LogoutButton />
      </div>
    </main>
  );
}
