"use client";

import clsx from "clsx";
import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type { UseDashboardContentResult } from "./useDashboardContent";

interface LoadingSkeletonProps {
  message?: string;
}

function LoadingSkeleton({ message }: LoadingSkeletonProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded-md bg-slate-200" />
        <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((key) => (
          <Card key={key} className="border-dashed border-indigo-100/70">
            <CardHeader className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-24 animate-pulse rounded bg-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Card className="border-dashed border-indigo-100/70">
          <CardContent className="h-72 animate-pulse rounded-xl bg-slate-100" />
        </Card>
        <Card className="border-dashed border-indigo-100/70">
          <CardContent className="h-96 animate-pulse rounded-xl bg-slate-100" />
        </Card>
      </div>
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50 text-red-700">
      <CardHeader>
        <CardTitle>ダッシュボードを読み込めませんでした</CardTitle>
        <CardDescription className="text-red-600/80">
          ページを再読み込みしても解消しない場合は、時間をおいて再度お試しください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{message}</p>
      </CardContent>
    </Card>
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
      "rounded-2xl border border-indigo-100/70 bg-white/80 p-3 shadow-sm",
      depth > 0 && "border-dashed",
    );

    const node = (
      <li key={chapter.id} className={baseClasses}>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-indigo-900">
            {chapter.name}
          </p>
          <span className="text-xs text-indigo-600">UNIT {units.length}</span>
        </div>
        {chapter.description ? (
          <p className="mt-1 text-xs text-indigo-600/80">
            {chapter.description}
          </p>
        ) : null}
        {units.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {units.map((unit) => (
              <li
                key={unit.id}
                className="flex items-center justify-between rounded-xl bg-indigo-50/70 px-3 py-1.5 text-xs text-indigo-700"
              >
                <span className="truncate pr-2 font-medium">{unit.name}</span>
                <span className="shrink-0 text-[11px] text-indigo-600">
                  {unit.questionCount}問
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
            UNITがまだ登録されていません。
          </p>
        )}
        {chapter.children.length > 0 ? (
          <ul className="mt-3 space-y-2 border-l-2 border-dashed border-indigo-100/70 pl-3">
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
    return (
      <div className="max-w-3xl">
        <ErrorState message="学習データの取得中に問題が発生しました。" />
      </div>
    );
  }

  const totalQuestionCount = materials.reduce(
    (accumulator, material) => accumulator + material.totalQuestionCount,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-3xl border border-indigo-100/70 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {greetingName}さん、おかえりなさい！
            </h1>
            <p className="text-sm text-muted-foreground">
              利用可能な問題は {totalQuestionCount}{" "}
              問です。今日もコツコツ積み重ねていきましょう。
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-600">
            <span className="rounded-full bg-indigo-100 px-3 py-1 font-semibold">
              学習記録を更新中
            </span>
            <span className="text-muted-foreground">
              前回の学習：昨日 22:15
            </span>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.id} className="border border-indigo-100/60">
            <CardHeader>
              <CardDescription className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                {card.label}
              </CardDescription>
              <CardTitle className="text-2xl text-slate-900">
                {card.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{card.helperText}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Card className="border border-indigo-100/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">学習カレンダー</CardTitle>
              <CardDescription>
                最近の学習量をヒートマップで確認しましょう
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground">
              合計 {calendar.days.length} 日分
            </span>
          </CardHeader>
          <CardContent>
            {calendar.days.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-12 text-sm text-indigo-600">
                <p>まだ学習履歴がありません。</p>
                <p className="text-xs">
                  UNIT詳細画面から学習を開始すると、ここに履歴が表示されます。
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {calendar.days.map((day) => (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-1"
                    title={`${day.date} / ${day.totalAnswers}問`}
                  >
                    <span className="text-[11px] text-muted-foreground">
                      {formatDateLabel(day.date)}
                    </span>
                    <span
                      className={clsx(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold",
                        heatmapCellClass(day.intensity),
                      )}
                    >
                      {day.totalAnswers}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-indigo-100/70">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">教材一覧</CardTitle>
              <CardDescription>
                学習したい教材とUNITを選択しましょう
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground">
              全 {materials.length} 件
            </span>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-12 text-sm text-indigo-600">
                <p>まだ教材が登録されていません。</p>
                <p className="text-xs">
                  管理画面から教材を追加すると、ここに表示されます。
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-white via-white to-indigo-50/60 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-900">
                          {material.name}
                        </h3>
                        {material.description ? (
                          <p className="text-xs text-indigo-700/80">
                            {material.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3 rounded-full bg-white/80 px-3 py-1 text-xs text-indigo-700 shadow-sm">
                        <span>UNIT {material.totalUnitCount}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>章 {material.chapterCount}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>問題 {material.totalQuestionCount}</span>
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-indigo-100/70">
                      <div
                        className="h-2 rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${material.progressRatePercent}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-indigo-700/80">
                      学習進捗 {material.progressRatePercent}%
                    </p>

                    <div className="mt-4 space-y-3">
                      {renderChapterList(material.chapters)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
