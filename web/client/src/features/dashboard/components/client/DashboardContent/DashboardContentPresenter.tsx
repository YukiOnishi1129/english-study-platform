"use client";

import clsx from "clsx";
import Link from "next/link";
import { type ReactElement, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { formatDateKey, startOfUtcDay } from "./calendarUtils";
import type { UseDashboardContentResult } from "./useDashboardContent";

interface LoadingSkeletonProps {
  message?: string;
}

function LoadingSkeleton({ message }: LoadingSkeletonProps) {
  return (
    <div className="space-y-6">
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
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-dashed border-indigo-100/70">
          <CardContent className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </Card>
        <Card className="border-dashed border-indigo-100/70">
          <CardContent className="h-64 animate-pulse rounded-xl bg-slate-100" />
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
  if (intensity <= 0) return "bg-slate-100 text-slate-500";
  if (intensity < 0.25) return "bg-indigo-100 text-indigo-800";
  if (intensity < 0.5) return "bg-indigo-200 text-indigo-800";
  if (intensity < 0.75) return "bg-indigo-400 text-white";
  return "bg-indigo-600 text-white";
}

function formatDateLabel(dateString: string) {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function renderUnitPreview(
  materials: UseDashboardContentResult["materials"],
): ReactElement[] {
  return materials.map((material) => {
    const firstUnits = material.chapters.flatMap((chapter) =>
      chapter.units.slice(0, 2),
    );
    const unitPreview = firstUnits.slice(0, 3);

    return (
      <div
        key={material.id}
        className="rounded-2xl border border-indigo-100/70 bg-white/90 p-4 shadow-sm"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-900">
              {material.name}
            </p>
            {material.description ? (
              <p className="text-xs text-muted-foreground">
                {material.description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>UNIT {material.totalUnitCount}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>問題 {material.totalQuestionCount}</span>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-indigo-100/70">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${material.progressRatePercent}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          学習進捗 {material.progressRatePercent}%
        </p>
        {unitPreview.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-indigo-800">
            {unitPreview.map((unit) => (
              <li key={unit.id} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-indigo-400" />
                <Link
                  href={`/units/${unit.id}`}
                  className="truncate text-indigo-700 hover:underline"
                >
                  {unit.name}
                </Link>
                <span className="text-[11px] text-indigo-500">
                  {unit.questionCount}問
                </span>
              </li>
            ))}
            {material.totalUnitCount > unitPreview.length ? (
              <li className="text-[11px] text-muted-foreground">
                ほか {material.totalUnitCount - unitPreview.length} UNIT…
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            UNITがまだ登録されていません。
          </p>
        )}
      </div>
    );
  });
}

export function DashboardContentPresenter(props: UseDashboardContentResult) {
  const { greetingName, statsCards, calendar, materials, isLoading, isError } =
    props;
  const todayLabel = formatDateKey(startOfUtcDay(new Date()));
  const monthLabels = useMemo(
    () => buildMonthLabels(calendar.weeks),
    [calendar.weeks],
  );

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
    <div className="space-y-6">
      <Card className="border border-indigo-100/70 bg-white/95">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {greetingName}さん、おかえりなさい！
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              利用可能な問題は {totalQuestionCount}{" "}
              問です。今日も無理なく学習を続けましょう。
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            前回の学習：昨日 22:15
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border border-indigo-100/70">
          <CardHeader>
            <CardTitle className="text-lg">学習サマリー</CardTitle>
            <CardDescription>
              これまでの進捗を一目で確認できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {statsCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-indigo-100/70 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900"
                >
                  <p className="text-xs font-medium text-indigo-500">
                    {card.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold">{card.value}</p>
                  <p className="mt-1 text-[11px] text-indigo-700/80">
                    {card.helperText}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-indigo-100/70">
          <CardHeader>
            <CardTitle className="text-lg">今日のおすすめ</CardTitle>
            <CardDescription>
              昨日解いた内容を軽く復習してウォームアップしましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              英会話フレーズ大特訓：第1章
              定型フレーズ編の復習から始めると効果的です。
            </p>
            <p>3問だけ解いて感覚を取り戻したら、新しい教材に進みましょう。</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
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
            {calendar.weeks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-12 text-sm text-indigo-600">
                <p>まだ学習履歴がありません。</p>
                <p className="text-xs">
                  UNIT詳細画面から学習を開始すると、ここに履歴が表示されます。
                </p>
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                  {WEEKDAY_LABELS.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="ml-6 flex gap-[4px] text-[11px] text-muted-foreground">
                    {monthLabels.map((item) => (
                      <span key={item.key} className="w-6 text-center">
                        {item.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-[2px]">
                    {calendar.weeks.map((week, weekIndex) => (
                      <div
                        key={calendarWeekKey(week, weekIndex)}
                        className="grid grid-cols-1 gap-[2px]"
                      >
                        {week.map((day, dayIndex) => (
                          <div
                            key={calendarDayKey(weekIndex, dayIndex, day.date)}
                            className={clsx(
                              "relative h-6 w-6 rounded-[3px]",
                              heatmapCellClass(day.intensity),
                              day.date === todayLabel &&
                                "ring-2 ring-offset-1 ring-indigo-400",
                            )}
                            title={
                              day.date
                                ? `${day.date} / ${day.totalAnswers}問`
                                : undefined
                            }
                          >
                            {day.date ? (
                              <span className="sr-only">
                                {formatDateLabel(day.date)}: {day.totalAnswers}
                                問
                              </span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-indigo-100/70">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">教材一覧</CardTitle>
                <CardDescription>
                  学習したい教材とUNITを確認しましょう
                </CardDescription>
              </div>
              <span className="text-xs text-muted-foreground">
                全 {materials.length} 件
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {materials.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-5 py-10 text-center text-sm text-indigo-600">
                まだ教材が登録されていません。管理画面から追加すると、ここに表示されます。
              </div>
            ) : (
              renderUnitPreview(materials)
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

interface MonthLabelItem {
  key: string;
  label: string;
}

function calendarWeekKey(
  week: UseDashboardContentResult["calendar"]["weeks"][number],
  fallbackIndex: number,
): string {
  const firstDayWithDate = week.find((day) => day.date && !day.isPlaceholder);
  if (firstDayWithDate?.date) {
    return `week-${firstDayWithDate.date}`;
  }
  const lastDayWithDate = [...week].reverse().find((day) => day.date);
  if (lastDayWithDate?.date) {
    return `week-${lastDayWithDate.date}`;
  }
  return `week-${fallbackIndex}`;
}

function calendarDayKey(
  weekIndex: number,
  dayIndex: number,
  date: string | null | undefined,
) {
  if (date) {
    return `day-${date}`;
  }
  return `day-${weekIndex}-${dayIndex}`;
}

function buildMonthLabels(
  weeks: UseDashboardContentResult["calendar"]["weeks"],
): MonthLabelItem[] {
  const labels: MonthLabelItem[] = [];
  let lastMonth: number | null = null;
  weeks.forEach((week) => {
    const firstDayWithDate = week.find((day) => day.date && !day.isPlaceholder);
    if (!firstDayWithDate?.date) {
      labels.push({ key: calendarWeekKey(week, labels.length), label: "" });
      return;
    }
    const date = new Date(firstDayWithDate.date);
    const month = date.getMonth();
    if (lastMonth === null || month !== lastMonth) {
      labels.push({
        key: calendarWeekKey(week, labels.length),
        label: `${month + 1}月`,
      });
      lastMonth = month;
    } else {
      labels.push({ key: calendarWeekKey(week, labels.length), label: "" });
    }
  });
  return labels;
}
