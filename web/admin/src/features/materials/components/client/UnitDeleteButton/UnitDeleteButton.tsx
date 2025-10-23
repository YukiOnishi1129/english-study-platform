"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toChapterDetailPath } from "@/features/materials/lib/paths";

interface UnitDeleteButtonProps {
  unitId: string;
  unitName: string;
  chapterId: string;
  materialId: string;
  deleteUnitAction: (payload: {
    unitId: string;
    chapterId: string;
    materialId: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

export function UnitDeleteButton(props: UnitDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDelete = () => {
    const confirmed = window.confirm(
      `UNIT「${props.unitName}」を削除しますか？\nこの操作は元に戻せません。配下の問題と正解もすべて削除されます。`,
    );
    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await props.deleteUnitAction({
          unitId: props.unitId,
          chapterId: props.chapterId,
          materialId: props.materialId,
        });

        if (!result.success) {
          setErrorMessage(result.message ?? "UNITの削除に失敗しました。");
          return;
        }

        setSuccessMessage(result.message ?? "UNITを削除しました。");
        router.push(toChapterDetailPath(props.chapterId));
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "UNITの削除に失敗しました。",
        );
      }
    });
  };

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-red-700">UNITを削除</h3>
          <p className="text-xs text-red-600">
            配下の問題・正解もすべて削除されます。履歴を保持したい場合は削除を行わず非表示の運用をご検討ください。
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {isPending ? "削除中..." : "UNITを削除"}
        </button>
      </div>
      {errorMessage ? (
        <p className="text-xs text-red-700">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="text-xs text-emerald-700">{successMessage}</p>
      ) : null}
      <p className="text-xs text-gray-600">
        UNITを残したまま問題を削除したい場合は、問題詳細の削除機能をご利用ください。
      </p>
    </div>
  );
}
