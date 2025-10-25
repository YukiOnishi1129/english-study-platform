"use client";

import { QuestionEditFormPresenter } from "./QuestionEditFormPresenter";
import type { QuestionEditFormProps } from "./types";
import { useQuestionEditForm } from "./useQuestionEditForm";

export function QuestionEditForm(props: QuestionEditFormProps) {
  const state = useQuestionEditForm(props);
  return <QuestionEditFormPresenter {...state} />;
}
