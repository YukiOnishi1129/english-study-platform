import "server-only";

import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/features/auth/components/client/LogoutButton";
import { requireAdmin } from "@/features/auth/servers/auth-check.server";

interface AuthenticatedLayoutWrapperProps {
  children: ReactNode;
}

export async function AuthenticatedLayoutWrapper({
  children,
}: AuthenticatedLayoutWrapperProps) {
  const account = await requireAdmin();

  return (
    <div className="bg-slate-50 text-slate-900 flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-6 py-8 lg:flex lg:flex-col lg:gap-8">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            English Study Platform
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">
            Admin Console
          </h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-600">
          <Link
            href="/"
            className="rounded-md px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600"
          >
            ダッシュボード
          </Link>
          <Link
            href="/materials/import"
            className="rounded-md px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600"
          >
            CSVインポート
          </Link>
        </nav>
        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} English Study Platform
        </p>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                ログイン中の管理者
              </p>
              <p className="text-sm text-slate-500">
                {account.firstName} {account.lastName}（{account.email}）
              </p>
            </div>
            <div>
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
