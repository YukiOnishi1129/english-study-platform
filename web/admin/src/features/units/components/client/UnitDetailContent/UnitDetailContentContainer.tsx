"use client";

import { UnitDetailContentPresenter } from "./UnitDetailContentPresenter";
import { useUnitDetailContent } from "./useUnitDetailContent";

interface UnitDetailContentProps {
  unitId: string;
}

export function UnitDetailContent(props: UnitDetailContentProps) {
  const { unitId } = props;
  const {
    detail,
    isLoading,
    isError,
    selectedQuestionIds,
    isBulkDeleting,
    onToggleQuestionSelect,
    onToggleAllQuestions,
    onBulkDelete,
  } = useUnitDetailContent({ unitId });

  return (
    <UnitDetailContentPresenter
      detail={detail}
      isLoading={isLoading}
      isError={isError}
      selectedQuestionIds={selectedQuestionIds}
      isBulkDeleting={isBulkDeleting}
      onToggleQuestionSelect={onToggleQuestionSelect}
      onToggleAllQuestions={onToggleAllQuestions}
      onBulkDelete={onBulkDelete}
    />
  );
}
