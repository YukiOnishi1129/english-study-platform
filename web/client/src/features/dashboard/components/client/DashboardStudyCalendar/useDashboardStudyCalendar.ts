"use client";

import { useMemo } from "react";

import { useMediaQuery } from "@/shared/lib/useMediaQuery";

import { formatDateKey, startOfUtcDay } from "@/shared/utils/date";
import type { DashboardCalendarViewModel } from "../DashboardContent/useDashboardContent";

export const WEEKDAY_LABELS = [
  "日",
  "月",
  "火",
  "水",
  "木",
  "金",
  "土",
] as const;

export interface MonthLabelItem {
  key: string;
  label: string;
}

export interface CalendarStyles {
  columnGapClass: string;
  cellSizeClass: string;
  monthHeightClass: string;
  monthTextClass: string;
  monthColumnWidthClass: string;
  dayLabelWidthClass: string;
  dayHeightClass: string;
  dayTextClass: string;
  dayLeadingClass: string;
  wrapperPaddingClass: string;
  todayRingClass: string;
  isCompact: boolean;
}

export interface DashboardStudyCalendarPresenter {
  weeks: DashboardCalendarViewModel["weeks"];
  monthLabels: MonthLabelItem[];
  styles: CalendarStyles;
  displayedDayCount: number;
  totalDayCount: number;
  isSubset: boolean;
  todayLabel: string;
}

export function calendarWeekKey(
  week: DashboardCalendarViewModel["weeks"][number],
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

export function useDashboardStudyCalendar(
  calendar: DashboardCalendarViewModel,
): DashboardStudyCalendarPresenter {
  const isCompactCalendar = useMediaQuery("(max-width: 640px)");

  const weeks = useMemo(() => {
    if (!isCompactCalendar) {
      return calendar.weeks;
    }
    const sliceCount = 24;
    return calendar.weeks.slice(-sliceCount);
  }, [isCompactCalendar, calendar.weeks]);

  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);

  const styles: CalendarStyles = useMemo(() => {
    const columnGapClass = isCompactCalendar ? "gap-[2px]" : "gap-[3px]";
    const cellSizeClass = isCompactCalendar
      ? "h-[10px] w-[10px]"
      : "h-[13px] w-[13px]";
    const monthHeightClass = isCompactCalendar ? "h-[16px]" : "h-[18px]";
    const monthColumnWidthClass = isCompactCalendar ? "w-[10px]" : "w-[13px]";
    const monthTextClass = isCompactCalendar ? "text-[9px]" : "text-[10px]";
    const dayLabelWidthClass = isCompactCalendar ? "w-[20px]" : "w-[18px]";
    const dayHeightClass = isCompactCalendar ? "h-[11px]" : "h-[13px]";
    const dayTextClass = isCompactCalendar ? "text-[10px]" : "text-[11px]";
    const dayLeadingClass = isCompactCalendar
      ? "leading-[11px]"
      : "leading-[13px]";
    const wrapperPaddingClass = isCompactCalendar ? "pr-2" : "pr-3";
    const todayRingClass = isCompactCalendar
      ? "ring-1 ring-offset-[1px] ring-indigo-400"
      : "ring-2 ring-offset-1 ring-indigo-400";

    return {
      columnGapClass,
      cellSizeClass,
      monthHeightClass,
      monthTextClass,
      monthColumnWidthClass,
      dayLabelWidthClass,
      dayHeightClass,
      dayTextClass,
      dayLeadingClass,
      wrapperPaddingClass,
      todayRingClass,
      isCompact: isCompactCalendar,
    } satisfies CalendarStyles;
  }, [isCompactCalendar]);

  return {
    weeks,
    monthLabels,
    styles,
    displayedDayCount: weeks.length * 7,
    totalDayCount: calendar.days.length,
    isSubset: weeks.length !== calendar.weeks.length,
    todayLabel: formatDateKey(startOfUtcDay(new Date())),
  };
}

function buildMonthLabels(
  weeks: DashboardCalendarViewModel["weeks"],
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
