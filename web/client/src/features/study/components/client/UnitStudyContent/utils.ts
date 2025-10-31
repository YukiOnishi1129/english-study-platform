import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";
import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";

import type {
  UnitStudyBreadcrumbItem,
  UnitStudyModeStatisticsViewModel,
  UnitStudyQuestionStatisticsViewModel,
} from "./useUnitStudyContent";

export function buildBreadcrumb(
  detail: UnitDetailDto | null,
): UnitStudyBreadcrumbItem[] {
  if (!detail) {
    return [];
  }

  const items: UnitStudyBreadcrumbItem[] = [
    {
      id: detail.material.id,
      label: detail.material.name,
      href: `/materials/${detail.material.id}`,
    },
  ];

  detail.chapterPath.forEach((chapter) => {
    items.push({
      id: chapter.id,
      label: chapter.name,
      href: null,
    });
  });

  items.push({
    id: detail.unit.id,
    label: detail.unit.name,
    href: `/units/${detail.unit.id}`,
  });

  items.push({
    id: `${detail.unit.id}-study`,
    label: "学習",
    href: null,
  });

  return items;
}

export function mapStatistics(
  stats: UnitDetailDto["questions"][number]["statistics"],
  modeStats?: UnitDetailDto["questions"][number]["modeStatistics"],
): UnitStudyQuestionStatisticsViewModel | null {
  if (!stats) {
    return null;
  }

  const byMode: Partial<Record<StudyMode, UnitStudyModeStatisticsViewModel>> =
    {};

  if (modeStats) {
    Object.entries(modeStats).forEach(([mode, value]) => {
      const serialized: UnitStudyModeStatisticsViewModel = {
        totalAttempts: value.totalAttempts,
        correctCount: value.correctCount,
        incorrectCount: value.incorrectCount,
        accuracy: value.accuracy,
        lastAttemptedAt: value.lastAttemptedAt,
      };
      byMode[mode as StudyMode] = serialized;
    });
  }

  return {
    totalAttempts: stats.totalAttempts,
    correctCount: stats.correctCount,
    incorrectCount: stats.incorrectCount,
    accuracy: stats.accuracy,
    lastAttemptedAt: stats.lastAttemptedAt,
    byMode,
  } satisfies UnitStudyQuestionStatisticsViewModel;
}

export function buildMaterialDetail(detail: UnitDetailDto | null) {
  if (!detail) {
    return null;
  }
  return detail.material satisfies UnitDetailDto["material"];
}

export function buildUnit(detail: UnitDetailDto | null) {
  if (!detail) {
    return null;
  }
  return detail.unit satisfies UnitDetailDto["unit"];
}
