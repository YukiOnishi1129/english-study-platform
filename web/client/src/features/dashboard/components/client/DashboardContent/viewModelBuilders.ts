"use client";

import type {
  DashboardMaterialChapterDto,
  DashboardMaterialSummaryDto,
  DashboardStudyCalendarEntryDto,
} from "@/external/dto/dashboard/dashboard.query.dto";

import {
  addUtcDays,
  formatDateKey,
  startOfUtcDay,
  startOfWeek,
} from "@/shared/lib/date";
import type {
  DashboardCalendarDayViewModel,
  DashboardCalendarViewModel,
  DashboardMaterialCardViewModel,
} from "./useDashboardContent";

export interface DashboardMaterialUnitPreview {
  id: string;
  name: string;
  questionCount: number;
}

export function buildCalendarViewModel(
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

  const weeks: DashboardCalendarViewModel["weeks"] = [];
  const completeDays: DashboardCalendarDayViewModel[] = [];

  const startWeek = addUtcDays(startOfWeek(today), -51 * 7);

  for (let weekIndex = 0; weekIndex < 52; weekIndex += 1) {
    const weekStart = addUtcDays(startWeek, weekIndex * 7);
    const week: DashboardCalendarViewModel["weeks"][number] = [];
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

export function buildMaterialCardViewModel(
  material: DashboardMaterialSummaryDto,
): DashboardMaterialCardViewModel {
  const flatUnits = collectUnits(material.chapters);
  const unitPreview = flatUnits.slice(0, 3);
  const remainingUnitCount = Math.max(
    0,
    material.totalUnitCount - unitPreview.length,
  );
  const nextPlayableUnit = flatUnits.find((unit) => unit.questionCount > 0);

  return {
    id: material.id,
    name: material.name,
    description: material.description ?? null,
    totalUnitCount: material.totalUnitCount,
    totalQuestionCount: material.totalQuestionCount,
    progressRatePercent: Math.round(material.progressRate * 100),
    unitPreview,
    remainingUnitCount,
    nextUnitId: nextPlayableUnit?.id ?? null,
  } satisfies DashboardMaterialCardViewModel;
}

function collectUnits(
  chapters: DashboardMaterialChapterDto[],
): DashboardMaterialUnitPreview[] {
  return chapters.flatMap((chapter) => {
    const currentUnits = chapter.units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      questionCount: unit.questionCount,
    }));
    const childUnits =
      chapter.children.length > 0 ? collectUnits(chapter.children) : [];
    return [...currentUnits, ...childUnits];
  });
}
