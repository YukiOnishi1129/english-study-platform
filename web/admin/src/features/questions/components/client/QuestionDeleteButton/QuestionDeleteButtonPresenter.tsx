"use client";

import { DeleteConfirmDialog } from "@/shared/components/ui/delete-confirm-dialog";
import { LoadingOverlay } from "@/shared/components/ui/loading-overlay";

export interface QuestionDeleteButtonPresenterProps {
  supportingText: string;
  isPending: boolean;
  errorMessage: string | null;
  onDelete: () => void;
}

export function QuestionDeleteButtonPresenter(
  props: QuestionDeleteButtonPresenterProps,
) {
  const { supportingText, isPending, errorMessage, onDelete } = props;

  return (
    <>
      <LoadingOverlay isOpen={isPending} label="問題の削除を実行しています…" />
      <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
        <div>
          <h3 className="font-semibold text-red-700">削除</h3>
          <p className="mt-1 text-xs text-red-600">{supportingText}</p>
        </div>
        <DeleteConfirmDialog
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              問題を削除
            </button>
          }
          title="問題を削除しますか？"
          description="この操作は取り消せません。関連するデータも合わせて削除されます。"
          onConfirm={onDelete}
          isPending={isPending}
          errorMessage={errorMessage}
          confirmLabel="削除する"
          confirmPendingLabel="削除中..."
          contentClassName="max-w-sm"
        />
      </div>
    </>
  );
}
