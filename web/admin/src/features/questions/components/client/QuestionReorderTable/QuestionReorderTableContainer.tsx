"use client";

import { QuestionReorderTablePresenter } from "./QuestionReorderTablePresenter";
import type { QuestionReorderTableProps } from "./types";
import { useQuestionReorderTable } from "./useQuestionReorderTable";

export function QuestionReorderTable(props: QuestionReorderTableProps) {
  const state = useQuestionReorderTable(props);
  return <QuestionReorderTablePresenter {...state} />;
}
