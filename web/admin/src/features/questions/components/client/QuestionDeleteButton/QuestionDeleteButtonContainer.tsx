"use client";

import { QuestionDeleteButtonPresenter } from "./QuestionDeleteButtonPresenter";
import { useQuestionDeleteButton } from "./useQuestionDeleteButton";

export interface QuestionDeleteButtonContainerProps {
  questionId: string;
  unitId: string;
  materialId: string;
  chapterIds: string[];
}

export function QuestionDeleteButton(
  props: QuestionDeleteButtonContainerProps,
) {
  const state = useQuestionDeleteButton(props);

  return (
    <QuestionDeleteButtonPresenter
      supportingText={state.supportingText}
      isPending={state.isPending}
      errorMessage={state.errorMessage}
      onDelete={state.onDelete}
    />
  );
}
