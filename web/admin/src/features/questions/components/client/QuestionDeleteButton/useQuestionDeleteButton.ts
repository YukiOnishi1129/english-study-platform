"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { deleteQuestionAction } from "@/features/materials/actions/deleteQuestionAction";
import { toUnitDetailPath } from "@/features/materials/lib/paths";
import type { QuestionDeleteButtonContainerProps } from "./QuestionDeleteButtonContainer";

interface UseQuestionDeleteButtonState {
  supportingText: string;
  isPending: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onDelete: () => void;
}

export function useQuestionDeleteButton(
  props: QuestionDeleteButtonContainerProps,
): UseQuestionDeleteButtonState {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDelete = useCallback(() => {
    if (isPending) {
      return;
    }

    const confirmed = window.confirm(
      "この問題を削除しますか？この操作は元に戻せません。",
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await deleteQuestionAction({
          questionId: props.questionId,
        });

        if (!result.success) {
          throw new Error(result.message ?? "問題の削除に失敗しました。");
        }

        setSuccessMessage("問題を削除しました。");
        router.push(toUnitDetailPath(result.unitId));
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "問題の削除に失敗しました。再度お試しください。",
        );
      }
    });
  }, [isPending, props.questionId, router]);

  return {
    supportingText:
      "問題を完全に削除します。関連する解答履歴は現時点では保持されません。",
    isPending,
    errorMessage,
    successMessage,
    onDelete: handleDelete,
  };
}
