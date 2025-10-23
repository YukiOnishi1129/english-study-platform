import Link from "next/link";
import type { ChapterDetailDto } from "@/external/dto/material/material.query.dto";
import { ChapterEditForm } from "@/features/chapters/components/client/ChapterEditForm";
import { toChapterDetailPath } from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

interface ChapterEditContentPresenterProps {
  detail: ChapterDetailDto | undefined;
  isLoading: boolean;
  isError: boolean;
  onSubmit: (state: FormState, formData: FormData) => Promise<FormState>;
}

export function ChapterEditContentPresenter(
  props: ChapterEditContentPresenterProps,
) {
  const { detail, isLoading, isError, onSubmit } = props;

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
      </main>
    );
  }

  if (isError || !detail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          章の情報を取得できませんでした。時間を置いて再度お試しください。
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href={toChapterDetailPath(detail.chapter.id)}
          className="inline-flex items-center gap-1 text-indigo-600 underline-offset-2 hover:underline"
        >
          ← 章詳細に戻る
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">章情報を編集</h1>
        <p className="text-sm text-gray-600">
          {detail.material.name}
          {detail.ancestors.length > 0
            ? ` / ${detail.ancestors.map((item) => item.name).join(" / ")}`
            : ""}
          {detail.ancestors.length > 0 ? " / " : ""}
          {detail.chapter.name}
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <ChapterEditForm
          action={onSubmit}
          defaultValues={{
            chapterId: detail.chapter.id,
            materialId: detail.material.id,
            parentChapterId: detail.chapter.parentChapterId,
            name: detail.chapter.name,
            description: detail.chapter.description,
          }}
        />
      </section>
    </main>
  );
}
