import Link from "next/link";
import type { MaterialHierarchyItemDto } from "@/external/dto/material/material.query.dto";
import { MaterialEditForm } from "@/features/materials/components/client/MaterialEditForm";
import { toMaterialDetailPath } from "@/features/materials/lib/paths";

interface MaterialEditContentPresenterProps {
  materialId: string;
  detail: MaterialHierarchyItemDto | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function MaterialEditContentPresenter(
  props: MaterialEditContentPresenterProps,
) {
  const { materialId, detail, isLoading, isError } = props;

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
        <div className="h-40 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
      </main>
    );
  }

  if (isError || !detail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          教材の情報を取得できませんでした。時間を置いて再度お試しください。
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href={toMaterialDetailPath(materialId)}
          className="inline-flex items-center gap-1 text-indigo-600 underline-offset-2 hover:underline"
        >
          ← 教材詳細に戻る
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">教材情報を編集</h1>
        <p className="text-sm text-gray-600">{detail.name}</p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <MaterialEditForm
          defaultValues={{
            materialId,
            name: detail.name,
            description: detail.description,
          }}
        />
      </section>
    </main>
  );
}
