"use client";

import { useQuestionDetailQuery } from "@/features/questions/queries/useQuestionDetailQuery";
import { QuestionEditContentPresenter } from "./QuestionEditContentPresenter";

interface QuestionEditContentProps {
  questionId: string;
}

export function QuestionEditContent(props: QuestionEditContentProps) {
  const { data, isLoading, isError } = useQuestionDetailQuery(props.questionId);

  return (
    <QuestionEditContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
