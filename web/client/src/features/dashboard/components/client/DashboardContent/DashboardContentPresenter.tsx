"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactElement, useCallback, useMemo, useTransition } from "react";
import type { Route } from "next";
import { getNextStudyTargetAction } from "@/external/handler/study/next-study-target.query.action";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useMediaQuery } from "@/shared/lib/useMediaQuery";
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
  const router = useRouter();
  const [isStartingStudy, startStudyTransition] = useTransition();
  const todayLabel = formatDateKey(startOfUtcDay(new Date()));
  const isCompactCalendar = useMediaQuery("(max-width: 640px)");
  const displayedWeeks = useMemo(() => {
    if (!isCompactCalendar) {
      return calendar.weeks;
    }
    const sliceCount = 24;
    return calendar.weeks.slice(-sliceCount);
  }, [calendar.weeks, isCompactCalendar]);
  const monthLabels = useMemo(
    () => buildMonthLabels(displayedWeeks),
    [displayedWeeks],
  );
  const calendarColumnGapClass = isCompactCalendar ? "gap-[2px]" : "gap-[3px]";
  const calendarCellSizeClass = isCompactCalendar
    ? "h-[10px] w-[10px]"
    : "h-[13px] w-[13px]";
  const calendarMonthHeightClass = isCompactCalendar ? "h-[16px]" : "h-[18px]";
  const calendarMonthTextClass = isCompactCalendar
    ? "text-[9px]"
    : "text-[10px]";
  const calendarDayLabelWidthClass = isCompactCalendar
    ? "w-[20px]"
    : "w-[18px]";
  const calendarColumnWidthClass = isCompactCalendar ? "w-[10px]" : "w-[13px]";
  const calendarDayHeightClass = isCompactCalendar ? "h-[11px]" : "h-[13px]";
  const calendarDayTextClass = isCompactCalendar
    ? "text-[10px]"
    : "text-[11px]";
  const calendarDayLeadingClass = isCompactCalendar
    ? "leading-[11px]"
    : "leading-[13px]";
  const calendarWrapperPaddingClass = isCompactCalendar ? "pr-2" : "pr-3";
  const todayRingClass = isCompactCalendar
    ? "ring-1 ring-offset-[1px] ring-indigo-400"
    : "ring-2 ring-offset-1 ring-indigo-400";
  const displayedDayCount = displayedWeeks.length * 7;
  const isShowingSubsetOfCalendar =
    displayedWeeks.length !== calendar.weeks.length;
  const handleStartStudy = useCallback(() => {
    startStudyTransition(() => {
      void (async () => {
        try {
          const target = await getNextStudyTargetAction();
          if (target) {
            const search = target.questionId
              ? `?questionId=${target.questionId}`
              : "";
            router.push(
              `/units/${target.unitId}/study${search}` as Route,
            );
          } else {
            router.push("/materials");
          }
        } catch (_error) {
          router.push("/materials");
        }
      })();
    });
  }, [router]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[992px] px-6">
        <LoadingSkeleton message="学習状況を準備しています..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[992px] px-6">
        <ErrorState message="学習データの取得中に問題が発生しました。" />
      </div>
    );
  }

  const totalQuestionCount = materials.reduce(
    (accumulator, material) => accumulator + material.totalQuestionCount,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-[992px] space-y-6 px-4 sm:px-6">
      <Card className="border border-indigo-100/70 bg-white/95">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex flex-1 flex-col gap-2">
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
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              onClick={handleStartStudy}
              disabled={isStartingStudy}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
            >
              問題を解く
            </Button>
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
          <CardHeader className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">教材一覧</CardTitle>
                <CardDescription>
                  学習したい教材とUNITを確認しましょう
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  全 {materials.length} 件
                </span>
                <Link
                  href="/materials"
                  className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500"
                >
                  すべての教材を見る
                </Link>
              </div>
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

      <section>
        <Card className="border border-indigo-100/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">学習カレンダー</CardTitle>
              <CardDescription>
                最近の学習量をヒートマップで確認しましょう
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground">
              {isShowingSubsetOfCalendar ? (
                <>
                  表示 {displayedDayCount} 日分 / 全 {calendar.days.length} 日分
                </>
              ) : (
                <>合計 {calendar.days.length} 日分</>
              )}
            </span>
          </CardHeader>
          <CardContent>
            {displayedWeeks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-12 text-sm text-indigo-600">
                <p>まだ学習履歴がありません。</p>
                <p className="text-xs">
                  UNIT詳細画面から学習を開始すると、ここに履歴が表示されます。
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div
                  className={clsx(
                    "flex min-w-max items-start",
                    calendarColumnGapClass,
                    calendarWrapperPaddingClass,
                  )}
                >
                  <div className="flex flex-col items-end text-muted-foreground">
                    <div className={calendarMonthHeightClass} />
                    <div
                      className={clsx(
                        "mt-[2px] flex flex-col",
                        calendarColumnGapClass,
                        calendarDayTextClass,
                      )}
                    >
                      {WEEKDAY_LABELS.map((label) => (
                        <span
                          key={label}
                          className={clsx(
                            calendarDayHeightClass,
                            calendarDayLabelWidthClass,
                            "text-right",
                            calendarDayLeadingClass,
                          )}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className={clsx("flex", calendarColumnGapClass)}>
                      {monthLabels.map((item) => (
                        <div
                          key={item.key}
                          className={clsx(
                            "relative",
                            calendarMonthHeightClass,
                            calendarColumnWidthClass,
                          )}
                        >
                          {item.label ? (
                            <span
                              className={clsx(
                                "pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap leading-none text-muted-foreground",
                                calendarMonthTextClass,
                              )}
                            >
                              {item.label}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <div
                      className={clsx("mt-[2px] flex", calendarColumnGapClass)}
                    >
                      {displayedWeeks.map((week, weekIndex) => (
                        <div
                          key={calendarWeekKey(week, weekIndex)}
                          className={clsx(
                            "flex flex-col",
                            calendarColumnGapClass,
                          )}
                        >
                          {week.map((day, dayIndex) => {
                            const key = calendarDayKey(
                              weekIndex,
                              dayIndex,
                              day.date,
                            );
                            const baseClasses = clsx(
                              calendarCellSizeClass,
                              isCompactCalendar
                                ? "rounded-[2px]"
                                : "rounded-[3px]",
                              heatmapCellClass(day.intensity),
                              day.date === todayLabel && todayRingClass,
                            );

                            if (!day.date) {
                              return (
                                <div
                                  key={key}
                                  className={clsx(
                                    baseClasses,
                                    "pointer-events-none opacity-60",
                                  )}
                                />
                              );
                            }

                            return (
                              <Tooltip key={key}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={clsx(
                                      baseClasses,
                                      "cursor-pointer",
                                    )}
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={6}>
                                  <div className="space-y-1">
                                    <p className="font-semibold">
                                      {formatDateLabel(day.date)}
                                    </p>
                                    <p className="text-xs">
                                      解答 {day.totalAnswers}問 / 正解{" "}
                                      {day.correctAnswers}問
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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

function _buildMonthLabels(
  weeks: UseDashboardContentResult["calendar"]["weeks"],
): MonthLabelItem[] {
  const labels: MonthLabelItem[] = [];
  let lastMonth: number | null = null;
  weeks.forEach((week, index) => {
    const firstDayWithDate = week.find((day) => day.date && !day.isPlaceholder);
    if (!firstDayWithDate?.date) {
      labels.push({ key: calendarWeekKey(week, index), label: "" });
      return;
    }
    const date = new Date(firstDayWithDate.date);
    const month = date.getMonth();
    if (lastMonth === null || month !== lastMonth) {
      labels.push({
        key: calendarWeekKey(week, index),
        label: `${month + 1}月`,
      });
      lastMonth = month;
    } else {
      labels.push({ key: calendarWeekKey(week, index), label: "" });
    }
  });
  return labels;
}

// function _calendarWeekKey(
//   week: UseDashboardContentResult["calendar"]["weeks"][number],
//   fallbackIndex: number,
// ): string {
//   const firstDayWithDate = week.find((day) => day.date && !day.isPlaceholder);
//   if (firstDayWithDate?.date) {
//     return `week-${firstDayWithDate.date}`;
//   }
//   const lastDayWithDate = [...week].reverse().find((day) => day.date);
//   if (lastDayWithDate?.date) {
//     return `week-${lastDayWithDate.date}`;
//   }
//   return `week-${fallbackIndex}`;
// }

// function _calendarDayKey(
//   weekIndex: number,
//   dayIndex: number,
//   date: string | null | undefined,
// ) {
//   if (date) {
//     return `day-${date}`;
//   }
//   return `day-${weekIndex}-${dayIndex}`;
// }

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
  weeks.forEach((week, index) => {
    const firstDayWithDate = week.find((day) => day.date);
    if (!firstDayWithDate?.date) {
      labels.push({ key: calendarWeekKey(week, index), label: "" });
      return;
    }

    const firstDayOfMonth = week.find((day) => {
      if (!day.date) return false;
      const date = new Date(day.date);
      return date.getDate() === 1;
    });

    const monthForLabel = firstDayOfMonth
      ? new Date(firstDayOfMonth.date).getMonth()
      : new Date(firstDayWithDate.date).getMonth();

    const shouldShowLabel =
      Boolean(firstDayOfMonth) ||
      lastMonth === null ||
      monthForLabel !== lastMonth;

    labels.push({
      key: calendarWeekKey(week, index),
      label: shouldShowLabel ? `${monthForLabel + 1}月` : "",
    });

    lastMonth = monthForLabel;
  });
  return labels;
}
