"use client";

import { UnitStudyQuestionCardPresenter } from "./UnitStudyQuestionCardPresenter";
import type { UnitStudyQuestionCardProps } from "./useUnitStudyQuestionCard";
import { useUnitStudyQuestionCard } from "./useUnitStudyQuestionCard";

export function UnitStudyQuestionCard(props: UnitStudyQuestionCardProps) {
  const view = useUnitStudyQuestionCard(props);
  return <UnitStudyQuestionCardPresenter {...view} />;
}

export type { UnitStudyQuestionCardProps };
