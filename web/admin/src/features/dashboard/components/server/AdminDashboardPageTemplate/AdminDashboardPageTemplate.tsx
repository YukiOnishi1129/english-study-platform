import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/features/auth/servers/auth-check.server";

export async function AdminDashboardPageTemplate() {
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
      <section className="grid gap-4 md:grid-cols-2">
        <article className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              教材・UNIT管理
            </h2>
            <p className="mt-2 text-gray-600">
              教材の階層を確認し、各UNITの画面から問題をCSVでインポートできます。新しい問題管理フローをこちらから試せます。
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/materials"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
            >
              教材管理へ
            </Link>
          </div>
        </article>
        <article className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ユーザー管理
            </h2>
            <p className="mt-2 text-gray-600">
              学習者アカウントのロール確認や無効化、利用状況の把握が行える専用画面を今後追加予定です。
            </p>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            機能の準備が整い次第、サイドメニューにリンクを表示します。
          </div>
        </article>
      </section>
    </main>
  );
}
