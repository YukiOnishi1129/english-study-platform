import Link from "next/link";
import type { UnitDetailDto } from "@/external/dto/material/material.query.dto";
import { toUnitDetailPath } from "@/features/materials/lib/paths";
import { UnitEditForm } from "@/features/units/components/client/UnitEditForm";

interface UnitEditContentPresenterProps {
  detail: UnitDetailDto | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function UnitEditContentPresenter(props: UnitEditContentPresenterProps) {
  const { detail, isLoading, isError } = props;

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
      </main>
    );
  }

  if (isError || !detail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          UNITの情報を取得できませんでした。時間を置いて再度お試しください。
        </div>
      </main>
    );
  }

  const currentChapter =
    detail.chapterPath.length > 0
      ? detail.chapterPath[detail.chapterPath.length - 1]
      : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href={toUnitDetailPath(detail.unit.id)}
          className="inline-flex items-center gap-1 text-indigo-600 underline-offset-2 hover:underline"
        >
          ← UNIT詳細に戻る
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">UNIT情報を編集</h1>
        <p className="text-sm text-gray-600">
          {detail.material.name} /{" "}
          {detail.chapterPath.map((chapter) => chapter.name).join(" / ")} /{" "}
          {detail.unit.name}
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <UnitEditForm
          defaultValues={{
            unitId: detail.unit.id,
            materialId: detail.material.id,
            chapterId: currentChapter?.id ?? detail.unit.chapterId,
            name: detail.unit.name,
            description: detail.unit.description,
          }}
        />
      </section>
    </main>
  );
}
