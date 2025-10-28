"use client";

import { useMemo } from "react";
import type { DashboardStudyCalendarEntryDto } from "@/external/dto/dashboard/dashboard.query.dto";
import { useDashboardQuery } from "@/features/dashboard/queries/useDashboardQuery";
import {
  buildCalendarViewModel,
  buildMaterialCardViewModel,
  type DashboardMaterialUnitPreview,
} from "./viewModelBuilders";

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

export interface DashboardMaterialCardViewModel {
  id: string;
  name: string;
  description: string | null;
  totalUnitCount: number;
  totalQuestionCount: number;
  progressRatePercent: number;
  unitPreview: DashboardMaterialUnitPreview[];
  remainingUnitCount: number;
  nextUnitId: string | null;
}

export type DashboardCalendarWeek = DashboardCalendarDayViewModel[];

export interface DashboardCalendarViewModel {
  days: DashboardCalendarDayViewModel[];
  maxCount: number;
  weeks: DashboardCalendarWeek[];
}

export interface DashboardHeaderViewModel {
  greetingName: string;
  totalQuestionCount: number;
}

export interface DashboardContentViewModel {
  isLoading: boolean;
  isError: boolean;
  loadingMessage: string;
  header: DashboardHeaderViewModel;
  statsCards: DashboardStatCardViewModel[];
  materials: DashboardMaterialCardViewModel[];
  calendar: DashboardCalendarViewModel;
}

export function useDashboardContent(
  options: UseDashboardContentOptions,
): DashboardContentViewModel {
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

  const totalQuestionCount = useMemo(() => {
    return materials.reduce(
      (accumulator, material) => accumulator + material.totalQuestionCount,
      0,
    );
  }, [materials]);

  const header: DashboardHeaderViewModel = useMemo(
    () => ({
      greetingName: displayName,
      totalQuestionCount,
    }),
    [displayName, totalQuestionCount],
  );

  return {
    isLoading,
    isError,
    loadingMessage: "学習状況を準備しています...",
    header,
    statsCards,
    materials,
    calendar,
  };
}
