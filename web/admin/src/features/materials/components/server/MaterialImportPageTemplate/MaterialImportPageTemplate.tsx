import Link from "next/link";
import { MaterialCsvImporter } from "@/features/materials/components/client/MaterialCsvImporter";

export function MaterialImportPageTemplate() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CSVインポート</h1>
          <p className="mt-2 text-sm text-gray-600">
            教材CSVをアップロードして、教材・章・UNIT・問題をプレビューします。
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          ← ダッシュボードに戻る
        </Link>
      </div>

      <MaterialCsvImporter />
    </main>
  );
}
