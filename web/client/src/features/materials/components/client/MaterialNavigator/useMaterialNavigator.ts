import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";

export interface MaterialNavigatorUnitView {
  id: string;
  name: string;
  description: string | null;
  questionCount: number;
  solvedQuestionCount: number;
  remainingCount: number;
  isPlayable: boolean;
  isCompleted: boolean;
  href: `/units/${string}` | null;
}

export interface MaterialNavigatorChapterView {
  id: string;
  name: string;
  description: string | null;
  units: MaterialNavigatorUnitView[];
}

export interface UseMaterialNavigatorResult {
  chapters: MaterialNavigatorChapterView[];
  hasChapters: boolean;
}

export function useMaterialNavigator(
  chapters: MaterialDetailDto["chapters"],
): UseMaterialNavigatorResult {
  const chapterViews = chapters.map<MaterialNavigatorChapterView>((chapter) => {
    const units = chapter.units.map<MaterialNavigatorUnitView>((unit) => {
      const remaining =
        unit.questionCount - unit.solvedQuestionCount >= 0
          ? unit.questionCount - unit.solvedQuestionCount
          : 0;
      const isPlayable = unit.questionCount > 0;
      const isCompleted = unit.questionCount > 0 && remaining === 0;
      const href = isPlayable ? (`/units/${unit.id}/study` as const) : null;

      return {
        id: unit.id,
        name: unit.name,
        description: unit.description,
        questionCount: unit.questionCount,
        solvedQuestionCount: unit.solvedQuestionCount,
        remainingCount: remaining,
        isPlayable,
        isCompleted,
        href,
      };
    });

    return {
      id: chapter.id,
      name: chapter.name,
      description: chapter.description,
      units,
    };
  });

  return {
    chapters: chapterViews,
    hasChapters: chapterViews.length > 0,
  };
}
