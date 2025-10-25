"use client";

import { useQuestionDetailQuery } from "@/features/questions/queries/useQuestionDetailQuery";
import { QuestionDetailContentPresenter } from "./QuestionDetailContentPresenter";

interface QuestionDetailContentProps {
  questionId: string;
}

export function QuestionDetailContent(props: QuestionDetailContentProps) {
  const { data, isLoading, isError } = useQuestionDetailQuery(props.questionId);

  return (
    <QuestionDetailContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
