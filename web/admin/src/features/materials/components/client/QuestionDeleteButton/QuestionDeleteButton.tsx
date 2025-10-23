"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteQuestionAction } from "@/features/materials/actions/deleteQuestionAction";
import { toUnitDetailPath } from "@/features/materials/lib/paths";

interface QuestionDeleteButtonProps {
  questionId: string;
  unitId: string;
}

export function QuestionDeleteButton(props: QuestionDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDelete = () => {
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
  };

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-red-700">削除</h3>
          <p className="text-xs text-red-600">
            問題を完全に削除します。関連する解答履歴は現時点では保持されません。
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {isPending ? "削除中..." : "問題を削除"}
        </button>
      </div>
      {errorMessage ? (
        <p className="text-xs text-red-700">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="text-xs text-emerald-700">{successMessage}</p>
      ) : null}
    </div>
  );
}
