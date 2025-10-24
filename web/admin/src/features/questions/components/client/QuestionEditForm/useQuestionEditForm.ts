"use client";

import { useActionState, useEffect, useState } from "react";
import { initialFormState } from "@/features/materials/types/formState";
import {
  createAnswerField,
  toAnswerFields,
} from "@/features/questions/lib/answer-fields";
import type {
  QuestionEditFormPresenterProps,
  QuestionEditFormProps,
} from "./types";

export function useQuestionEditForm(
  props: QuestionEditFormProps,
): QuestionEditFormPresenterProps {
  const [state, formAction] = useActionState(props.action, initialFormState);
  const [answers, setAnswers] = useState(() =>
    toAnswerFields(props.defaultValues.correctAnswers),
  );

  useEffect(() => {
    setAnswers(toAnswerFields(props.defaultValues.correctAnswers));
  }, [props.defaultValues.correctAnswers]);

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) =>
      prev.map((field) => (field.id === id ? { ...field, value } : field)),
    );
  };

  const handleAddAnswer = () => {
    setAnswers((prev) => [...prev, createAnswerField()]);
  };

  const handleRemoveAnswer = (id: string) => {
    setAnswers((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((field) => field.id !== id);
    });
  };

  return {
    formAction,
    state,
    defaultValues: props.defaultValues,
    answers,
    onAddAnswer: handleAddAnswer,
    onAnswerChange: handleAnswerChange,
    onRemoveAnswer: handleRemoveAnswer,
    isRemoveDisabled: answers.length <= 1,
  } satisfies QuestionEditFormPresenterProps;
}
