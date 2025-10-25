"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { materialKeys } from "@/features/materials/queries/keys";
import type { FormState } from "@/features/materials/types/formState";
import {
  createAnswerField,
  toAnswerFields,
} from "@/features/questions/lib/answer-fields";
import { questionKeys } from "@/features/questions/queries/keys";
import { unitKeys } from "@/features/units/queries/keys";
import { updateQuestionAction } from "./actions";
import type {
  QuestionEditFormPresenterProps,
  QuestionEditFormProps,
} from "./types";

export function useQuestionEditForm(
  props: QuestionEditFormProps,
): QuestionEditFormPresenterProps {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState(() =>
    toAnswerFields(props.defaultValues.correctAnswers),
  );

  useEffect(() => {
    setAnswers(toAnswerFields(props.defaultValues.correctAnswers));
  }, [props.defaultValues.correctAnswers]);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateQuestionAction(formData);
      if (result.status === "error") {
        throw new Error(result.message ?? "問題の更新に失敗しました。");
      }
      return result;
    },
    onSuccess: async (result) => {
      const invalidateTasks = [
        queryClient.invalidateQueries({
          queryKey: questionKeys.detail(props.defaultValues.questionId),
        }),
        queryClient.invalidateQueries({
          queryKey: unitKeys.detail(props.defaultValues.unitId),
        }),
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.context.materialId),
        }),
      ];

      props.context.chapterIds.forEach((chapterId) => {
        invalidateTasks.push(
          queryClient.invalidateQueries({
            queryKey: chapterKeys.detail(chapterId),
          }),
        );
      });

      await Promise.all(invalidateTasks);

      if (result.redirect) {
        router.replace(result.redirect as Parameters<typeof router.push>[0]);
      }

      router.refresh();
    },
  });

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      await mutation.mutateAsync(formData);
    },
    [mutation],
  );

  const handleAnswerChange = useCallback((id: string, value: string) => {
    setAnswers((prev) =>
      prev.map((field) => (field.id === id ? { ...field, value } : field)),
    );
  }, []);

  const handleAddAnswer = useCallback(() => {
    setAnswers((prev) => [...prev, createAnswerField()]);
  }, []);

  const handleRemoveAnswer = useCallback((id: string) => {
    setAnswers((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((field) => field.id !== id);
    });
  }, []);

  const status: FormState["status"] = mutation.isSuccess
    ? "success"
    : mutation.isError
      ? "error"
      : "idle";

  const message =
    mutation.isError && mutation.error instanceof Error
      ? mutation.error.message
      : mutation.data?.message;

  return {
    defaultValues: props.defaultValues,
    answers,
    status,
    message,
    isPending: mutation.isPending,
    onSubmit: handleSubmit,
    onAddAnswer: handleAddAnswer,
    onAnswerChange: handleAnswerChange,
    onRemoveAnswer: handleRemoveAnswer,
    isRemoveDisabled: answers.length <= 1,
  } satisfies QuestionEditFormPresenterProps;
}
