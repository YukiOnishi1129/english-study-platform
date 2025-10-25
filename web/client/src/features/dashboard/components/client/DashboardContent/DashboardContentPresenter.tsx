"use client";

import clsx from "clsx";
import type React from "react";
import type { UseDashboardContentResult } from "./useDashboardContent";

interface LoadingSkeletonProps {
  message?: string;
}

function LoadingSkeleton({ message }: LoadingSkeletonProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-80 animate-pulse rounded-md bg-gray-200" />
        <div className="h-4 w-60 animate-pulse rounded-md bg-gray-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((key) => (
          <div
            key={key}
            className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="mt-3 h-8 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="h-72 animate-pulse rounded-lg border border-gray-100 bg-white" />
        <div className="h-96 animate-pulse rounded-lg border border-gray-100 bg-white" />
      </div>
      {message ? <p className="mt-6 text-sm text-gray-500">{message}</p> : null}
    </main>
  );
}

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm">
        <h2 className="text-xl font-semibold">
          ダッシュボードを読み込めませんでした
        </h2>
        <p className="mt-3 text-sm leading-relaxed">{message}</p>
        <p className="mt-2 text-xs text-red-600/80">
          ページを再読み込みしても解消しない場合は、時間をおいて再度お試しください。
        </p>
      </div>
    </main>
  );
}

function heatmapCellClass(intensity: number) {
  if (intensity <= 0) {
    return "bg-slate-100 text-slate-500";
  }
  if (intensity < 0.25) {
    return "bg-indigo-100 text-indigo-800";
  }
  if (intensity < 0.5) {
    return "bg-indigo-200 text-indigo-800";
  }
  if (intensity < 0.75) {
    return "bg-indigo-400 text-white";
  }
  return "bg-indigo-600 text-white";
}

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function renderChapterList(
  chapters: UseDashboardContentResult["materials"][number]["chapters"],
  depth = 0,
): React.ReactElement[] {
  return chapters.flatMap((chapter) => {
    const units = chapter.units;
    const nextDepth = depth + 1;
    const baseClasses = clsx(
      "rounded-md border border-gray-100 bg-white/60 p-3",
      depth > 0 && "border-dashed",
    );

    const node = (
      <li key={chapter.id} className={baseClasses}>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800">{chapter.name}</p>
          <span className="text-xs text-gray-500">UNIT {units.length}</span>
        </div>
        {chapter.description ? (
          <p className="mt-1 text-xs text-gray-500">{chapter.description}</p>
        ) : null}
        {units.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {units.map((unit) => (
              <li
                key={unit.id}
                className="flex items-center justify-between rounded-md bg-indigo-50/60 px-2 py-1 text-xs text-indigo-700"
              >
                <span className="truncate pr-2 font-medium">{unit.name}</span>
                <span className="shrink-0 text-[11px] text-indigo-600">
                  {unit.questionCount}問
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 rounded bg-slate-50 px-2 py-1 text-xs text-slate-500">
            UNITがまだ登録されていません。
          </p>
        )}
        {chapter.children.length > 0 ? (
          <ul className="mt-3 space-y-2 pl-3 border-l-2 border-dashed border-indigo-100">
            {renderChapterList(chapter.children, nextDepth)}
          </ul>
        ) : null}
      </li>
    );

    return [node];
  });
}

export function DashboardContentPresenter(props: UseDashboardContentResult) {
  const { greetingName, statsCards, calendar, materials, isLoading, isError } =
    props;

  if (isLoading) {
    return <LoadingSkeleton message="学習状況を準備しています..." />;
  }

  if (isError) {
    return <ErrorState message="学習データの取得中に問題が発生しました。" />;
  }

  const totalQuestionCount = materials.reduce(
    (accumulator, material) => accumulator + material.totalQuestionCount,
    0,
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {greetingName}さん、おかえりなさい！
        </h1>
        <p className="text-sm text-gray-600">
          利用可能な問題は {totalQuestionCount}{" "}
          問です。今日もコツコツ積み重ねていきましょう。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <article
            key={card.id}
            className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              {card.label}
            </p>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {card.value}
            </p>
            <p className="mt-2 text-xs text-gray-500">{card.helperText}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <article className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                学習カレンダー
              </h2>
              <p className="text-xs text-gray-500">
                最近の学習量を振り返りましょう
              </p>
            </div>
            <span className="text-xs text-gray-400">
              合計 {calendar.days.length} 日分
            </span>
          </div>

          {calendar.days.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-sm text-gray-500">
              <p>まだ学習履歴がありません。</p>
              <p className="text-xs">
                UNIT詳細画面から学習を開始すると、ここに履歴が表示されます。
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-7 gap-2">
              {calendar.days.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1"
                  title={`${day.date} / ${day.totalAnswers}問`}
                >
                  <span className="text-[11px] text-gray-400">
                    {formatDateLabel(day.date)}
                  </span>
                  <span
                    className={clsx(
                      "flex h-10 w-10 items-center justify-center rounded-md text-xs font-semibold",
                      heatmapCellClass(day.intensity),
                    )}
                  >
                    {day.totalAnswers}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">教材一覧</h2>
              <p className="text-xs text-gray-500">
                学習したい教材とUNITを選択しましょう
              </p>
            </div>
            <span className="text-xs text-gray-400">
              全 {materials.length} 件
            </span>
          </div>

          {materials.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-sm text-gray-500">
              <p>まだ教材が登録されていません。</p>
              <p className="text-xs">
                管理画面から教材を追加すると、ここに表示されます。
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {materials.map((material) => (
                <section
                  key={material.id}
                  className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-sm"
                >
                  <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-900">
                        {material.name}
                      </h3>
                      {material.description ? (
                        <p className="text-xs text-indigo-600/80">
                          {material.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-indigo-700">
                      <span>UNIT {material.totalUnitCount}</span>
                      <span>章 {material.chapterCount}</span>
                      <span>問題 {material.totalQuestionCount}</span>
                    </div>
                  </header>

                  <div className="mt-4 h-2 rounded-full bg-indigo-100">
                    <div
                      className="h-2 rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${material.progressRatePercent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-indigo-600/80">
                    学習進捗 {material.progressRatePercent}%
                  </p>

                  <div className="mt-4">
                    <ul className="space-y-3">
                      {renderChapterList(material.chapters)}
                    </ul>
                  </div>
                </section>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
