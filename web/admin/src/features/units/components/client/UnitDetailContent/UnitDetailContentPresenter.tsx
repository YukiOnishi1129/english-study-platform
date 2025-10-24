import Link from "next/link";
import type { UnitDetailDto } from "@/external/dto/material/material.query.dto";
import { QuestionReorderTable } from "@/features/materials/components/client/QuestionReorderTable";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitEditPath,
} from "@/features/materials/lib/paths";
import { UnitDeleteButton } from "@/features/units/components/client/UnitDeleteButton";
import { UnitQuestionCsvImporter } from "@/features/units/components/client/UnitQuestionCsvImporter";

export interface UnitDetailContentPresenterProps {
  detail: UnitDetailDto | undefined;
  isLoading: boolean;
  isError: boolean;
  onDeleteUnit: (payload: {
    unitId: string;
    materialId: string;
    chapterId: string;
  }) => Promise<{ success: boolean; message?: string }>;
  onReorderQuestions: (data: {
    unitId: string;
    materialId: string;
    chapterIds: string[];
    orderedQuestionIds: string[];
  }) => Promise<{ success: boolean; message?: string }>;
}

export function UnitDetailContentPresenter(
  props: UnitDetailContentPresenterProps,
) {
  const { detail, isLoading, isError, onDeleteUnit, onReorderQuestions } =
    props;

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
          UNITの情報を取得できませんでした。時間を置いて再度お試しください。
        </div>
      </main>
    );
  }

  const questionCount = detail.questions.length;
  const currentChapter =
    detail.chapterPath.length > 0
      ? detail.chapterPath[detail.chapterPath.length - 1]
      : null;
  const unitQuestions = detail.questions.map((question) => ({
    id: question.id,
    order: question.order,
    japanese: question.japanese,
    updatedAt: question.updatedAt,
  }));
  const parentChapterId = currentChapter?.id ?? detail.unit.chapterId;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/materials"
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              教材一覧
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link
              href={toMaterialDetailPath(detail.material.id)}
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              {detail.material.name}
            </Link>
          </li>
          {detail.chapterPath.map((chapter) => (
            <li key={chapter.id} className="flex items-center gap-2">
              <span>›</span>
              <Link
                href={toChapterDetailPath(chapter.id)}
                className="text-indigo-600 underline-offset-2 hover:underline"
              >
                {chapter.name}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span>›</span>
            <span className="font-semibold text-gray-700">
              {detail.unit.name}
            </span>
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {detail.unit.name}
          </h1>
          <p className="text-sm text-gray-600">
            {detail.material.name} の{" "}
            {detail.chapterPath.map((chapter) => chapter.name).join(" / ")}{" "}
            配下のUNITです。
          </p>
        </div>
        <Link
          href={toUnitEditPath(detail.unit.id)}
          className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
        >
          UNIT情報を編集
        </Link>
      </header>

      <section className="grid gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-4">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            問題数
          </dt>
          <dd className="mt-2 text-3xl font-bold text-gray-900">
            {questionCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            並び順
          </dt>
          <dd className="mt-2 text-xl font-semibold text-gray-800">
            {detail.unit.order}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            作成日
          </dt>
          <dd className="mt-2 text-sm text-gray-700">
            {new Date(detail.unit.createdAt).toLocaleString("ja-JP")}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            最終更新
          </dt>
          <dd className="mt-2 text-sm text-gray-700">
            {new Date(detail.unit.updatedAt).toLocaleString("ja-JP")}
          </dd>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">問題の並び順</h2>
          <UnitQuestionCsvImporter
            unitId={detail.unit.id}
            unitName={detail.unit.name}
            materialId={detail.material.id}
            chapterId={parentChapterId}
            existingQuestionCount={questionCount}
          />
        </header>
        <QuestionReorderTable
          questions={unitQuestions}
          serverActionArgs={{
            unitId: detail.unit.id,
            materialId: detail.material.id,
            chapterIds: detail.chapterPath.map((chapter) => chapter.id),
          }}
          reorderUnitQuestionsAction={onReorderQuestions}
        />
      </section>

      <section>
        <UnitDeleteButton
          unitId={detail.unit.id}
          unitName={detail.unit.name}
          materialId={detail.material.id}
          chapterId={parentChapterId}
          deleteUnitAction={onDeleteUnit}
        />
      </section>
    </main>
  );
}
