import Link from "next/link";
import type {
  ChapterDetailDto,
  MaterialChapterSummaryDto,
} from "@/external/dto/material/material.query.dto";
import { ChapterCreateForm } from "@/features/chapters/components/client/ChapterCreateForm";
import { ChapterDeleteButton } from "@/features/chapters/components/client/ChapterDeleteButton";
import { ChapterUnitList } from "@/features/chapters/components/client/ChapterUnitList";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
} from "@/features/materials/lib/paths";
import { UnitCreateForm } from "@/features/units/components/client/UnitCreateForm";

interface ChapterDetailContentPresenterProps {
  detail: ChapterDetailDto | undefined;
  isLoading: boolean;
  isError: boolean;
}

function countChapters(chapters: MaterialChapterSummaryDto[]): number {
  return chapters.reduce(
    (total, chapter) => total + 1 + countChapters(chapter.children),
    0,
  );
}

function countUnits(chapters: MaterialChapterSummaryDto[]): number {
  return chapters.reduce(
    (total, chapter) =>
      total + chapter.units.length + countUnits(chapter.children),
    0,
  );
}

function renderChapter(
  chapter: MaterialChapterSummaryDto,
  materialId: string,
  rootChapterId: string,
) {
  const childChapters = [...chapter.children].sort((a, b) => a.order - b.order);

  return (
    <div key={chapter.id} className="space-y-3">
      <article className="rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <header className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              <Link
                href={toChapterDetailPath(chapter.id)}
                className="underline-offset-2 hover:underline"
              >
                {chapter.name}
              </Link>
            </h3>
            <span className="text-xs text-gray-500">
              {chapter.units.length} UNIT
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
              {chapter.contentType.name}
            </span>
          </div>
          {chapter.description ? (
            <p className="text-xs text-gray-600">{chapter.description}</p>
          ) : null}
        </header>

        <div className="mt-3">
          <ChapterUnitList
            materialId={materialId}
            chapterId={chapter.id}
            units={chapter.units}
            invalidateChapterId={rootChapterId}
          />
        </div>

        <details className="mt-4 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <summary className="cursor-pointer text-xs font-semibold text-gray-700">
            章やUNITを追加する
          </summary>
          <div className="mt-3 space-y-3">
            <UnitCreateForm
              chapterId={chapter.id}
              materialId={materialId}
              chapterName={chapter.name}
              invalidateChapterId={rootChapterId}
            />
            <ChapterCreateForm
              materialId={materialId}
              parentChapterId={chapter.id}
              parentChapterName={chapter.name}
              invalidateChapterId={rootChapterId}
            />
          </div>
        </details>
      </article>

      {childChapters.length > 0 ? (
        <div className="space-y-3 border-l border-gray-200 pl-4">
          {childChapters.map((child) =>
            renderChapter(child, materialId, rootChapterId),
          )}
        </div>
      ) : null}
    </div>
  );
}

export function ChapterDetailContentPresenter(
  props: ChapterDetailContentPresenterProps,
) {
  const { detail, isLoading, isError } = props;

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-40 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
        <div className="h-56 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
      </main>
    );
  }

  if (isError || !detail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          章の情報を取得できませんでした。時間を置いて再度お試しください。
        </div>
      </main>
    );
  }

  const { material, chapter, ancestors } = detail;
  const totalUnits = chapter.units.length + countUnits(chapter.children);
  const totalChapters = countChapters(chapter.children);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href={toMaterialDetailPath(material.id)}
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              {material.name}
            </Link>
          </li>
          {ancestors.map((ancestor) => (
            <li key={ancestor.id} className="flex items-center gap-2">
              <span>›</span>
              <Link
                href={toChapterDetailPath(ancestor.id)}
                className="text-indigo-600 underline-offset-2 hover:underline"
              >
                {ancestor.name}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span>›</span>
            <span className="font-semibold text-gray-700">{chapter.name}</span>
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{chapter.name}</h1>
          <p className="text-sm text-gray-600">
            {chapter.description ?? "説明は登録されていません。"}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {chapter.contentType.name}
            </span>
          </div>
        </div>
      </header>

      <section className="grid gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            子章の数
          </dt>
          <dd className="mt-2 text-2xl font-bold text-gray-900">
            {totalChapters}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            UNITの数
          </dt>
          <dd className="mt-2 text-2xl font-bold text-gray-900">
            {totalUnits}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            更新日時
          </dt>
          <dd className="mt-2 text-sm text-gray-700">
            {new Date(chapter.updatedAt).toLocaleString("ja-JP")}
          </dd>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">UNIT一覧</h2>
          <UnitCreateForm
            chapterId={chapter.id}
            materialId={material.id}
            chapterName={chapter.name}
            invalidateChapterId={chapter.id}
          />
        </header>

        <ChapterUnitList
          materialId={material.id}
          chapterId={chapter.id}
          units={chapter.units}
          invalidateChapterId={chapter.id}
        />
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">子章</h2>
          <ChapterCreateForm
            materialId={material.id}
            parentChapterId={chapter.id}
            parentChapterName={chapter.name}
            invalidateChapterId={chapter.id}
          />
        </header>
        {chapter.children.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-600">
            子章は登録されていません。
          </p>
        ) : (
          <div className="space-y-5">
            {chapter.children.map((child) =>
              renderChapter(child, material.id, chapter.id),
            )}
          </div>
        )}
      </section>

      <section>
        <ChapterDeleteButton
          chapterId={chapter.id}
          chapterName={chapter.name}
          materialId={material.id}
          parentChapterId={chapter.parentChapterId}
          ancestorChapterIds={ancestors.map((ancestor) => ancestor.id)}
        />
      </section>
    </main>
  );
}
