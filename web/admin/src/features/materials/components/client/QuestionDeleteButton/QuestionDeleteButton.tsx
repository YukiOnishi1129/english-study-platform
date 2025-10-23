"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
        const response = await fetch(`/api/questions/${props.questionId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ unitId: props.unitId }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.message ?? "問題の削除に失敗しました。");
        }

        setSuccessMessage("問題を削除しました。");
        router.push(toUnitDetailPath(props.unitId));
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
