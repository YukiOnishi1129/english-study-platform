import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/features/auth/components/client/LogoutButton";
import { getAuthenticatedAdmin } from "@/features/auth/servers/auth-check.server";

export default async function DashboardPage() {
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
              CSVインポート
            </h2>
            <p className="mt-2 text-gray-600">
              教材、章、UNIT、問題をCSVから一括で取り込みます。インポート前にプレビューで内容を確認できます。
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/materials/import"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
            >
              CSVインポート画面へ
            </Link>
          </div>
        </article>
        <article className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              次の開発項目
            </h2>
            <p className="mt-2 text-gray-600">
              学習進捗のダッシュボードや問題編集機能など、管理機能を順次整備していきます。
            </p>
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-500">近日公開予定</p>
          </div>
        </article>
      </section>
      <footer className="mt-auto flex items-center justify-between border-t border-gray-100 pt-6">
        <p className="text-sm text-gray-500">
          引き続き管理機能のアイデアを募集中です。
        </p>
        <div className="w-40">
          <LogoutButton />
        </div>
      </footer>
    </main>
  );
}
