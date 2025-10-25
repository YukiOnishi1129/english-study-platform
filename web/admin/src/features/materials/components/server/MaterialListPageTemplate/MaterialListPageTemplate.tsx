import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Link from "next/link";
import type { MaterialHierarchyItemDto } from "@/external/dto/material/material.query.dto";
import { listMaterialsHierarchy } from "@/external/handler/material/material.query.server";
import { MaterialList } from "@/features/materials/components/client/MaterialList";
import { materialKeys } from "@/features/materials/queries/keys";
import { getQueryClient } from "@/shared/lib/query-client";

export async function MaterialListPageTemplate() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: materialKeys.list(),
    queryFn: () => listMaterialsHierarchy(),
  });

  const prefetchedMaterials =
    queryClient.getQueryData<MaterialHierarchyItemDto[]>(materialKeys.list()) ??
    [];

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">教材一覧</h1>
          <p className="text-sm text-gray-600">
            教材の概要を確認し、詳細ページから章やUNITの管理・問題CSVインポートを行います。
          </p>
        </div>
        <Link
          href="/materials/create"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
        >
          新しい教材を作成
        </Link>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        {prefetchedMaterials.length === 0 ? (
          <section className="flex flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
            <div>
              <p className="text-base font-medium text-gray-700">
                まだ教材が登録されていません。
              </p>
              <p className="mt-2 text-sm">
                まず教材を作成し、その後、章やUNITを追加して構成を整えましょう。
              </p>
            </div>
            <Link
              href="/materials/create"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
            >
              教材を作成する
            </Link>
          </section>
        ) : (
          <MaterialList />
        )}
      </HydrationBoundary>
    </main>
  );
}
