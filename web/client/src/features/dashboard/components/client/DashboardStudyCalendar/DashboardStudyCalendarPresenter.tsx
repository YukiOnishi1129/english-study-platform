"use client";

import clsx from "clsx";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

import type { DashboardCalendarViewModel } from "../DashboardContent/useDashboardContent";
import {
  type CalendarStyles,
  calendarWeekKey,
  type DashboardStudyCalendarPresenterView,
  type MonthLabelItem,
  WEEKDAY_LABELS,
} from "./useDashboardStudyCalendar";

export interface DashboardStudyCalendarPresenterProps {
  presenter: DashboardStudyCalendarPresenterView;
}

export function DashboardStudyCalendarPresenter({
  presenter,
}: DashboardStudyCalendarPresenterProps) {
  if (presenter.weeks.length === 0) {
    return (
      <section>
        <Card className="border border-indigo-100/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">学習カレンダー</CardTitle>
              <CardDescription>
                最近の学習量をヒートマップで確認しましょう
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-12 text-sm text-indigo-600">
              <p>まだ学習履歴がありません。</p>
              <p className="text-xs">
                UNIT詳細画面から学習を開始すると、ここに履歴が表示されます。
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
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
            {presenter.isSubset ? (
              <>
                表示 {presenter.displayedDayCount} 日分 / 全{" "}
                {presenter.totalDayCount} 日分
              </>
            ) : (
              <>合計 {presenter.totalDayCount} 日分</>
            )}
          </span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-2">
            <div
              className={clsx(
                "flex min-w-max items-start",
                presenter.styles.columnGapClass,
                presenter.styles.wrapperPaddingClass,
              )}
            >
              <div className="flex flex-col items-end text-muted-foreground">
                <div className={presenter.styles.monthHeightClass} />
                <div
                  className={clsx(
                    "mt-[2px] flex flex-col",
                    presenter.styles.columnGapClass,
                    presenter.styles.dayTextClass,
                  )}
                >
                  {WEEKDAY_LABELS.map((label) => (
                    <span
                      key={label}
                      className={clsx(
                        presenter.styles.dayHeightClass,
                        presenter.styles.dayLabelWidthClass,
                        "text-right",
                        presenter.styles.dayLeadingClass,
                      )}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <div className={clsx("flex", presenter.styles.columnGapClass)}>
                  {presenter.monthLabels.map((item) => (
                    <MonthLabel
                      key={item.key}
                      item={item}
                      styles={presenter.styles}
                    />
                  ))}
                </div>
                <div
                  className={clsx(
                    "mt-[2px] flex",
                    presenter.styles.columnGapClass,
                  )}
                >
                  {presenter.weeks.map((week, weekIndex) => (
                    <div
                      key={weekKey(week, weekIndex)}
                      className={clsx(
                        "flex flex-col",
                        presenter.styles.columnGapClass,
                      )}
                    >
                      {week.map((day, dayIndex) => (
                        <StudyCalendarCell
                          key={dayKey(weekIndex, dayIndex, day.date)}
                          day={day}
                          styles={presenter.styles}
                          todayLabel={presenter.todayLabel}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

interface MonthLabelProps {
  item: MonthLabelItem;
  styles: CalendarStyles;
}

function MonthLabel({ item, styles }: MonthLabelProps) {
  return (
    <div
      className={clsx(
        "relative",
        styles.monthHeightClass,
        styles.monthColumnWidthClass,
      )}
    >
      {item.label ? (
        <span
          className={clsx(
            "pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap leading-none text-muted-foreground",
            styles.monthTextClass,
          )}
        >
          {item.label}
        </span>
      ) : null}
    </div>
  );
}

type CalendarDay = DashboardCalendarViewModel["weeks"][number][number];

interface StudyCalendarCellProps {
  day: CalendarDay;
  styles: CalendarStyles;
  todayLabel: string;
}

function StudyCalendarCell({
  day,
  styles,
  todayLabel,
}: StudyCalendarCellProps) {
  const baseClasses = clsx(
    styles.cellSizeClass,
    styles.isCompact ? "rounded-[2px]" : "rounded-[3px]",
    heatmapCellClass(day.intensity),
    day.date === todayLabel && styles.todayRingClass,
  );

  if (!day.date) {
    return (
      <div className={clsx(baseClasses, "pointer-events-none opacity-60")} />
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={clsx(baseClasses, "cursor-pointer")} />
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        <div className="space-y-1">
          <p className="font-semibold">{formatDateLabel(day.date)}</p>
          <p className="text-xs">
            解答 {day.totalAnswers}問 / 正解 {day.correctAnswers}問
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
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
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString ?? "";
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function weekKey(
  week: DashboardCalendarViewModel["weeks"][number],
  fallbackIndex: number,
) {
  return calendarWeekKey(week, fallbackIndex);
}

function dayKey(
  weekIndex: number,
  dayIndex: number,
  date: string | null | undefined,
) {
  if (date) {
    return `day-${date}`;
  }
  return `day-${weekIndex}-${dayIndex}`;
}
