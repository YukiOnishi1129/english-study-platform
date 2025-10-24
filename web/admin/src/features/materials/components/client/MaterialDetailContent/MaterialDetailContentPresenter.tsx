import Link from "next/link";
import type {
  MaterialChapterSummaryDto,
  MaterialHierarchyItemDto,
} from "@/external/dto/material/material.query.dto";
import { ChapterCreateForm } from "@/features/chapters/components/client/ChapterCreateForm";
import { ChapterUnitList } from "@/features/chapters/components/client/ChapterUnitList";
import { MaterialDeleteButton } from "@/features/materials/components/client/MaterialDeleteButton";
import {
  toChapterDetailPath,
  toMaterialEditPath,
} from "@/features/materials/lib/paths";
import { UnitCreateForm } from "@/features/units/components/client/UnitCreateForm";
import { Button } from "@/shared/components/ui/button";

interface MaterialDetailContentPresenterProps {
  materialId: string;
  detail: MaterialHierarchyItemDto | undefined;
  isLoading: boolean;
  isError: boolean;
}

function countUnits(chapters: MaterialChapterSummaryDto[]): number {
  return chapters.reduce(
    (total, chapter) =>
      total + chapter.units.length + countUnits(chapter.children),
    0,
  );
}

function countChapters(chapters: MaterialChapterSummaryDto[]): number {
  return chapters.reduce(
    (total, chapter) => total + 1 + countChapters(chapter.children),
    0,
  );
}

function renderChapter(
  chapter: MaterialChapterSummaryDto,
  material: MaterialHierarchyItemDto,
  depth = 0,
) {
  const indentClass = depth > 0 ? "pl-4 border-l border-gray-200" : "";
  const childChapters = [...chapter.children].sort((a, b) => a.order - b.order);
  const anchorId = `chapter-${chapter.id}`;

  return (
    <div
      key={chapter.id}
      className={`space-y-3 ${indentClass}`.trim()}
      id={anchorId}
    >
      <article className="rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <header className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              {chapter.level > 0 ? (
                <span className="mr-2 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                  Lv.{chapter.level}
                </span>
              ) : null}
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
          {chapter.description ? (
            <p className="text-xs text-gray-600">{chapter.description}</p>
          ) : null}
        </header>

        <div className="mt-3">
          <ChapterUnitList
            materialId={material.id}
            chapterId={chapter.id}
            units={chapter.units}
          />
        </div>

        <details className="mt-4 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <summary className="cursor-pointer text-xs font-semibold text-gray-700">
            章やUNITを追加する
          </summary>
          <div className="mt-3 space-y-3">
            <UnitCreateForm
              chapterId={chapter.id}
              materialId={material.id}
              chapterName={chapter.name}
            />
            <ChapterCreateForm
              materialId={material.id}
              parentChapterId={chapter.id}
              parentChapterName={chapter.name}
            />
          </div>
        </details>
      </article>

      {childChapters.map((child) => renderChapter(child, material, depth + 1))}
    </div>
  );
}

export function MaterialDetailContentPresenter(
  props: MaterialDetailContentPresenterProps,
) {
  const { materialId, detail, isLoading, isError } = props;

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-10">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-56 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
      </main>
    );
  }

  if (isError || !detail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          教材の情報を取得できませんでした。時間を置いて再度お試しください。
        </div>
      </main>
    );
  }

  const totalUnits = countUnits(detail.chapters);
  const totalChapters = countChapters(detail.chapters);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href="/materials"
          className="inline-flex items-center gap-1 text-indigo-600 underline-offset-2 hover:underline"
        >
          ← 教材一覧に戻る
        </Link>
      </nav>

      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{detail.name}</h1>
          <p className="text-sm text-gray-600">
            {detail.description ?? "説明は登録されていません。"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={toMaterialEditPath(materialId)}>教材情報を編集</Link>
        </Button>
      </header>

      <section className="grid gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            章の数（全階層）
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
            {new Date(detail.updatedAt).toLocaleString("ja-JP")}
          </dd>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">章の構成</h2>
          <details className="rounded-md border border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <summary className="cursor-pointer text-sm font-semibold text-indigo-800">
              ルート直下に章を追加する
            </summary>
            <div className="mt-3">
              <ChapterCreateForm materialId={materialId} />
            </div>
          </details>
        </header>

        {detail.chapters.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-600">
            章が登録されていません。上のフォームから章を追加しましょう。
          </p>
        ) : (
          <div className="space-y-5">
            {detail.chapters.map((chapter) => renderChapter(chapter, detail))}
          </div>
        )}
      </section>

      <section>
        <MaterialDeleteButton
          materialId={materialId}
          materialName={detail.name}
        />
      </section>
    </main>
  );
}
