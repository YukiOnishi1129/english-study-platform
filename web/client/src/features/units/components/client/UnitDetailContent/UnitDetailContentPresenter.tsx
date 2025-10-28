"use client";

import { UnitDetailBreadcrumb } from "./components/UnitDetailBreadcrumb";
import { UnitDetailError } from "./components/UnitDetailError";
import { UnitDetailLoading } from "./components/UnitDetailLoading";
import { UnitHeaderCard } from "./components/UnitHeaderCard";
import { UnitMaterialContextCard } from "./components/UnitMaterialContextCard";
import { UnitQuestionList } from "./components/UnitQuestionList";
import { UnitStatsGrid } from "./components/UnitStatsGrid";
import type { UseUnitDetailContentResult } from "./useUnitDetailContent";

export function UnitDetailContentPresenter(props: UseUnitDetailContentResult) {
  const {
    isLoading,
    isError,
    unit,
    material,
    breadcrumb,
    questionCount,
    uniqueAnswerCount,
    questions,
  } = props;

  if (isLoading) {
    return <UnitDetailLoading message="UNITの情報を準備しています..." />;
  }

  if (isError || !unit || !material) {
    return <UnitDetailError />;
  }

  return (
    <div className="space-y-6">
      <UnitDetailBreadcrumb items={breadcrumb} />
      <UnitHeaderCard unit={unit} />
      <UnitStatsGrid
        questionCount={questionCount}
        uniqueAnswerCount={uniqueAnswerCount}
      />
      <UnitMaterialContextCard material={material} />
      <UnitQuestionList questions={questions} />
    </div>
  );
}
