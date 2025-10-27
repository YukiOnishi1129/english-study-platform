"use client";

import { useMemo } from "react";
import type {
  DashboardMaterialChapterDto,
  DashboardMaterialSummaryDto,
  DashboardStudyCalendarEntryDto,
} from "@/external/dto/dashboard/dashboard.query.dto";
import { useDashboardQuery } from "@/features/dashboard/queries/useDashboardQuery";
import {
  addUtcDays,
  formatDateKey,
  startOfUtcDay,
  startOfWeek,
} from "./calendarUtils";

interface UseDashboardContentOptions {
  accountId: string;
  displayName: string;
}

export interface DashboardStatCardViewModel {
  id: string;
  label: string;
  value: string;
  helperText: string;
}

export interface DashboardCalendarDayViewModel
  extends DashboardStudyCalendarEntryDto {
  intensity: number;
  isPlaceholder: boolean;
}

export interface DashboardMaterialCardViewModel
  extends Omit<DashboardMaterialSummaryDto, "progressRate"> {
  progressRatePercent: number;
  chapterCount: number;
}

type DashboardCalendarWeek = DashboardCalendarDayViewModel[];

interface DashboardCalendarViewModel {
  days: DashboardCalendarDayViewModel[];
  maxCount: number;
  weeks: DashboardCalendarWeek[];
}

export interface UseDashboardContentResult {
  greetingName: string;
  statsCards: DashboardStatCardViewModel[];
  calendar: DashboardCalendarViewModel;
  materials: DashboardMaterialCardViewModel[];
  isLoading: boolean;
  isError: boolean;
}

function countChapters(chapters: DashboardMaterialChapterDto[]): number {
  return chapters.reduce((accumulator, chapter) => {
    return (
      accumulator +
      1 +
      (chapter.children.length > 0 ? countChapters(chapter.children) : 0)
    );
  }, 0);
}

function buildCalendarViewModel(
  calendar: DashboardStudyCalendarEntryDto[],
): DashboardCalendarViewModel {
  if (calendar.length === 0) {
    return { days: [], maxCount: 0, weeks: [] };
  }

  const maxCount = calendar.reduce(
    (max, entry) => Math.max(max, entry.totalAnswers),
    0,
  );

  const days = calendar.map((entry) => {
    const intensity = maxCount === 0 ? 0 : entry.totalAnswers / maxCount;
    return {
      ...entry,
      intensity,
      isPlaceholder: false,
    } satisfies DashboardCalendarDayViewModel;
  });

  const today = startOfUtcDay(new Date());
  const daysMap = new Map<string, DashboardCalendarDayViewModel>();
  days.forEach((day) => {
    daysMap.set(day.date, day);
  });

  const weeks: DashboardCalendarWeek[] = [];
  const completeDays: DashboardCalendarDayViewModel[] = [];

  const startWeek = addUtcDays(startOfWeek(today), -51 * 7);

  for (let weekIndex = 0; weekIndex < 52; weekIndex += 1) {
    const weekStart = addUtcDays(startWeek, weekIndex * 7);
    const week: DashboardCalendarWeek = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const current = addUtcDays(weekStart, dayIndex);
      const dateKey = formatDateKey(current);
      const existing = daysMap.get(dateKey);
      const day =
        existing ??
        ({
          date: dateKey,
          totalAnswers: 0,
          correctAnswers: 0,
          intensity: 0,
          isPlaceholder: true,
        } satisfies DashboardCalendarDayViewModel);
      week.push(day);
      completeDays.push(day);
    }
    weeks.push(week);
  }

  return { days: completeDays, maxCount, weeks };
}

function buildMaterialCardViewModel(
  material: DashboardMaterialSummaryDto,
): DashboardMaterialCardViewModel {
  const chapterCount = countChapters(material.chapters);

  return {
    ...material,
    chapterCount,
    progressRatePercent: Math.round(material.progressRate * 100),
  } satisfies DashboardMaterialCardViewModel;
}

export function useDashboardContent(
  options: UseDashboardContentOptions,
): UseDashboardContentResult {
  const { accountId, displayName } = options;
  const { data, isLoading, isError } = useDashboardQuery(accountId);

  const numberFormatter = useMemo(() => new Intl.NumberFormat("ja-JP"), []);

  const statsCards = useMemo<DashboardStatCardViewModel[]>(() => {
    if (!data) {
      return [];
    }

    const { stats } = data;
    const accuracyPercentage = Math.round(stats.accuracyRate * 100);

    return [
      {
        id: "today",
        label: "今日の学習",
        value: `${numberFormatter.format(stats.todayAnswerCount)}問`,
        helperText: "本日解答した問題数",
      },
      {
        id: "total",
        label: "累計解答数",
        value: `${numberFormatter.format(stats.totalAnswerCount)}問`,
        helperText: "これまで解いた問題数",
      },
      {
        id: "accuracy",
        label: "総正答率",
        value: `${numberFormatter.format(accuracyPercentage)}%`,
        helperText: `${numberFormatter.format(stats.correctAnswerCount)}問正解 / ${numberFormatter.format(stats.totalAnswerCount)}問`,
      },
      {
        id: "streak",
        label: "連続学習日数",
        value: `${numberFormatter.format(stats.studyStreakCount)}日`,
        helperText: "継続中の学習記録",
      },
    ];
  }, [data, numberFormatter]);

  const calendar = useMemo(() => {
    return buildCalendarViewModel(data?.studyCalendar ?? []);
  }, [data?.studyCalendar]);

  const materials = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.materials.map((material) =>
      buildMaterialCardViewModel(material),
    );
  }, [data]);

  return {
    greetingName: displayName,
    statsCards,
    calendar,
    materials,
    isLoading,
    isError,
  } satisfies UseDashboardContentResult;
}
