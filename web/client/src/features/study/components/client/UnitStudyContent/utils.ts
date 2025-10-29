import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";

import type {
  UnitStudyBreadcrumbItem,
  UnitStudyQuestionStatisticsViewModel,
  UnitStudyQuestionViewModel,
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
): UnitStudyQuestionStatisticsViewModel | null {
  if (!stats) {
    return null;
  }

  return {
    totalAttempts: stats.totalAttempts,
    correctCount: stats.correctCount,
    incorrectCount: stats.incorrectCount,
    accuracy: stats.accuracy,
    lastAttemptedAt: stats.lastAttemptedAt,
  } satisfies UnitStudyQuestionStatisticsViewModel;
}

export function buildQuestionViewModels(
  detail: UnitDetailDto | null,
): UnitStudyQuestionViewModel[] {
  if (!detail) {
    return [];
  }

  return detail.questions
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((question) => ({
      id: question.id,
      title: `Q${question.order}`,
      japanese: question.japanese,
      hint: question.hint,
      explanation: question.explanation,
      acceptableAnswers: question.correctAnswers.map(
        (answer) => answer.answerText,
      ),
      statistics: mapStatistics(question.statistics),
    }));
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
