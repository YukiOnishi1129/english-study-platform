import Link from "next/link";
import { MaterialCreateForm } from "@/features/materials/components/client/MaterialCreateForm";
import { createMaterialAction } from "./actions";

export const dynamic = "force-dynamic";

export function MaterialCreatePageTemplate() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">新規教材を作成</h1>
        <p className="text-sm text-gray-600">
          教材の基本情報を入力してください。作成後に章やUNITを追加できます。
        </p>
      </header>

      <section>
        <MaterialCreateForm action={createMaterialAction} />
      </section>

      <footer className="mt-auto">
        <Link
          href="/materials"
          className="inline-flex items-center gap-2 text-sm text-gray-600 underline-offset-4 hover:underline"
        >
          ← 教材一覧へ戻る
        </Link>
      </footer>
    </main>
  );
}
