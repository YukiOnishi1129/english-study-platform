"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { deleteQuestionAction } from "@/features/materials/actions/deleteQuestionAction";
import { toUnitDetailPath } from "@/features/materials/lib/paths";
import { materialKeys } from "@/features/materials/queries/keys";
import { questionKeys } from "@/features/questions/queries/keys";
import { unitKeys } from "@/features/units/queries/keys";
import type { QuestionDeleteButtonContainerProps } from "./QuestionDeleteButtonContainer";

interface UseQuestionDeleteButtonState {
  supportingText: string;
  isPending: boolean;
  errorMessage: string | null;
  onDelete: () => void;
}

export function useQuestionDeleteButton(
  props: QuestionDeleteButtonContainerProps,
): UseQuestionDeleteButtonState {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await deleteQuestionAction({
        questionId: props.questionId,
        unitId: props.unitId,
      });

      if (!result.success) {
        throw new Error(result.message ?? "問題の削除に失敗しました。");
      }
    },
    onSuccess: () => {
      setErrorMessage(null);

      const redirectPath = toUnitDetailPath(props.unitId);
      router.replace(redirectPath);

      void (async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: questionKeys.detail(props.questionId),
          }),
          queryClient.invalidateQueries({
            queryKey: unitKeys.detail(props.unitId),
          }),
          queryClient.invalidateQueries({
            queryKey: materialKeys.detail(props.materialId),
          }),
          queryClient.invalidateQueries({ queryKey: materialKeys.list() }),
          ...props.chapterIds.map((chapterId) =>
            queryClient.invalidateQueries({
              queryKey: chapterKeys.detail(chapterId),
            }),
          ),
        ]);

        router.refresh();
      })();
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "問題の削除に失敗しました。再度お試しください。",
      );
    },
  });

  const handleDelete = useCallback(() => {
    if (mutation.isPending) {
      return;
    }

    setErrorMessage(null);

    mutation.mutate();
  }, [mutation]);

  return {
    supportingText:
      "問題を完全に削除します。関連する解答履歴は現時点では保持されません。",
    isPending: mutation.isPending,
    errorMessage,
    onDelete: handleDelete,
  };
}
