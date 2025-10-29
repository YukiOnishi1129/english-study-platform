"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { UnitDetailDto } from "@/external/dto/material/material.query.dto";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitEditPath,
} from "@/features/materials/lib/paths";
import { QuestionReorderTable } from "@/features/questions/components/client/QuestionReorderTable";
import { UnitDeleteButton } from "@/features/units/components/client/UnitDeleteButton";
import { UnitQuestionCsvImporter } from "@/features/units/components/client/UnitQuestionCsvImporter";
import { VocabularyCsvImporter } from "@/features/units/components/client/VocabularyCsvImporter";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { DeleteConfirmDialog } from "@/shared/components/ui/delete-confirm-dialog";
import { Spinner } from "@/shared/components/ui/spinner";

export interface UnitDetailContentPresenterProps {
  detail: UnitDetailDto | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedQuestionIds: string[];
  isBulkDeleting: boolean;
  onToggleQuestionSelect: (questionId: string, nextSelected: boolean) => void;
  onToggleAllQuestions: (nextSelected: boolean) => void;
  onBulkDelete: () => void;
}

export function UnitDetailContentPresenter(
  props: UnitDetailContentPresenterProps,
) {
  const {
    detail,
    isLoading,
    isError,
    selectedQuestionIds,
    isBulkDeleting,
    onToggleQuestionSelect,
    onToggleAllQuestions,
    onBulkDelete,
  } = props;

  const vocabularyQuestionCount = useMemo(
    () =>
      detail?.questions.filter((question) => question.vocabularyEntryId)
        .length ?? 0,
    [detail?.questions],
  );
  const isPureVocabularyUnit = useMemo(() => {
    if (!detail) {
      return false;
    }
    if (detail.questions.length === 0) {
      return true;
    }
    return detail.questions.every((question) =>
      Boolean(question.vocabularyEntryId),
    );
  }, [detail]);

  const [importMode, setImportMode] = useState<"question" | "vocabulary">(
    isPureVocabularyUnit ? "vocabulary" : "question",
  );

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
    headword:
      question.headword ?? question.correctAnswers[0]?.answerText ?? null,
  }));
  const parentChapterId = currentChapter?.id ?? detail.unit.chapterId;
  const selectedCount = selectedQuestionIds.length;

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

      <div className="space-y-3">
        <Card className="flex flex-col gap-3 border border-gray-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-gray-900">CSV取り込み</h2>
            <p className="text-xs text-gray-600">
              問題数: {questionCount}問 / 語彙問題: {vocabularyQuestionCount}問
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={importMode === "question" ? "default" : "outline"}
              onClick={() => setImportMode("question")}
            >
              問題CSVを取り込む
            </Button>
            <Button
              type="button"
              size="sm"
              variant={importMode === "vocabulary" ? "default" : "outline"}
              onClick={() => setImportMode("vocabulary")}
            >
              語彙CSVを取り込む
            </Button>
          </div>
        </Card>

        {importMode === "question" ? (
          <UnitQuestionCsvImporter
            unitId={detail.unit.id}
            unitName={detail.unit.name}
            materialId={detail.material.id}
            chapterId={parentChapterId}
            existingQuestionCount={questionCount}
          />
        ) : (
          <VocabularyCsvImporter
            unitId={detail.unit.id}
            unitName={detail.unit.name}
            materialId={detail.material.id}
            chapterId={parentChapterId}
            existingQuestionCount={questionCount}
          />
        )}
      </div>

      <section className="space-y-4">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">
              問題の並び順
            </h2>
            {selectedCount > 0 ? (
              <p className="text-xs text-red-600">
                {selectedCount} 件の問題が選択されています。
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <DeleteConfirmDialog
              trigger={
                <Button
                  variant="destructive"
                  disabled={selectedCount === 0 || isBulkDeleting}
                  className="gap-2"
                >
                  {isBulkDeleting ? (
                    <>
                      <Spinner className="text-white" />
                      <span>削除中...</span>
                    </>
                  ) : (
                    <span>選択した問題を削除</span>
                  )}
                </Button>
              }
              title="選択した問題を削除しますか？"
              description={`${selectedCount}件の問題を削除します。この操作は取り消せません。`}
              confirmLabel="削除する"
              confirmPendingLabel="削除中..."
              onConfirm={onBulkDelete}
              isPending={isBulkDeleting}
            />
          </div>
        </header>
        <QuestionReorderTable
          unitId={detail.unit.id}
          materialId={detail.material.id}
          chapterIds={detail.chapterPath.map((chapter) => chapter.id)}
          questions={unitQuestions}
          selectable
          selectedIds={selectedQuestionIds}
          onToggleSelect={onToggleQuestionSelect}
          onToggleSelectAll={onToggleAllQuestions}
          disabled={isBulkDeleting}
        />
      </section>

      <section>
        <UnitDeleteButton
          unitId={detail.unit.id}
          unitName={detail.unit.name}
          materialId={detail.material.id}
          chapterId={parentChapterId}
        />
      </section>
    </main>
  );
}
