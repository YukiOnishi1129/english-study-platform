"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { DeleteConfirmDialog } from "@/shared/components/ui/delete-confirm-dialog";

interface MaterialDeleteButtonProps {
  materialId: string;
  materialName: string;
  deleteMaterialAction: (payload: {
    materialId: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

export function MaterialDeleteButton(props: MaterialDeleteButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await props.deleteMaterialAction({
          materialId: props.materialId,
        });

        if (!result.success) {
          setErrorMessage(result.message ?? "教材の削除に失敗しました。");
          return;
        }

        setIsDialogOpen(false);
        router.push("/materials");
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "教材の削除に失敗しました。",
        );
      }
    });
  };

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-red-700">教材を削除</h3>
          <p className="text-xs text-red-600">
            教材配下の章・UNIT・問題・正解がすべて削除されます。履歴を残したい場合は非表示運用をご検討ください。
          </p>
        </div>
        <DeleteConfirmDialog
          trigger={
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="text-xs"
            >
              教材を削除
            </Button>
          }
          title={`教材「${props.materialName}」を削除しますか？`}
          description="この操作は元に戻せません。教材配下の全てのコンテンツが削除されます。"
          confirmLabel="削除する"
          confirmPendingLabel="削除中..."
          cancelLabel="キャンセル"
          isPending={isPending}
          errorMessage={errorMessage}
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setErrorMessage(null);
            }
            setIsDialogOpen(open);
          }}
          onConfirm={() => {
            if (isPending) {
              return;
            }
            handleConfirm();
          }}
        />
      </div>
      <p className="text-xs text-gray-600">
        データ保全が必要な場合は削除前にバックアップを取得してください。
      </p>
    </div>
  );
}
