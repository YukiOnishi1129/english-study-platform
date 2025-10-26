"use client";

import { useMemo } from "react";
import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";
import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";

interface UseUnitDetailContentOptions {
  unitId: string;
}

export interface UnitBreadcrumbItem {
  id: string;
  label: string;
  href: string | null;
}

export interface UnitQuestionViewModel {
  id: string;
  title: string;
  order: number;
  japanese: string;
  hint: string | null;
  explanation: string | null;
  answerSamples: string[];
}

export interface UseUnitDetailContentResult {
  isLoading: boolean;
  isError: boolean;
  unit: UnitDetailDto["unit"] | null;
  material: UnitDetailDto["material"] | null;
  breadcrumb: UnitBreadcrumbItem[];
  questionCount: number;
  uniqueAnswerCount: number;
  questions: UnitQuestionViewModel[];
}

function buildBreadcrumb(detail: UnitDetailDto | null): UnitBreadcrumbItem[] {
  if (!detail) {
    return [];
  }

  const items: UnitBreadcrumbItem[] = [
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
    href: null,
  });

  return items;
}

export function useUnitDetailContent(
  options: UseUnitDetailContentOptions,
): UseUnitDetailContentResult {
  const { unitId } = options;
  const { data, isLoading, isError } = useUnitDetailQuery(unitId);

  const breadcrumb = useMemo(() => buildBreadcrumb(data ?? null), [data]);

  const questions = useMemo<UnitQuestionViewModel[]>(() => {
    if (!data) {
      return [];
    }

    return data.questions.map((question) => ({
      id: question.id,
      title: `Q${question.order}`,
      order: question.order,
      japanese: question.japanese,
      hint: question.hint,
      explanation: question.explanation,
      answerSamples: question.correctAnswers
        .map((answer) => answer.answerText)
        .slice(0, 3),
    }));
  }, [data]);

  const uniqueAnswerCount = useMemo(() => {
    if (!data) {
      return 0;
    }
    const set = new Set<string>();
    data.questions.forEach((question) => {
      question.correctAnswers.forEach((answer) => {
        set.add(answer.answerText);
      });
    });
    return set.size;
  }, [data]);

  return {
    isLoading,
    isError,
    unit: data?.unit ?? null,
    material: data?.material ?? null,
    breadcrumb,
    questionCount: data?.questions.length ?? 0,
    uniqueAnswerCount,
    questions,
  };
}
