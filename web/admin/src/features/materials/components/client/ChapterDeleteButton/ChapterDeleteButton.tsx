"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormRedirect } from "@/features/materials/types/formState";
import { Button } from "@/shared/components/ui/button";
import { DeleteConfirmDialog } from "@/shared/components/ui/delete-confirm-dialog";

interface ChapterDeleteButtonProps {
  chapterId: string;
  chapterName: string;
  materialId: string;
  parentChapterId: string | null;
  ancestorChapterIds: string[];
  deleteChapterAction: (payload: {
    chapterId: string;
    materialId: string;
    parentChapterId: string | null;
    ancestorChapterIds: string[];
  }) => Promise<{
    success: boolean;
    message?: string;
    redirect?: FormRedirect;
  }>;
}

export function ChapterDeleteButton(props: ChapterDeleteButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await props.deleteChapterAction({
          chapterId: props.chapterId,
          materialId: props.materialId,
          parentChapterId: props.parentChapterId,
          ancestorChapterIds: props.ancestorChapterIds,
        });

        if (!result.success) {
          setErrorMessage(result.message ?? "章の削除に失敗しました。");
          return;
        }

        setIsDialogOpen(false);

        if (result.redirect) {
          type RouterPushArgument = Parameters<typeof router.push>[0];
          router.push(result.redirect as RouterPushArgument);
        }
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "章の削除に失敗しました。",
        );
      }
    });
  };

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-red-700">章を削除</h3>
          <p className="text-xs text-red-600">
            この章と配下にある子章・UNIT・問題・正解がすべて削除されます。
            履歴を残したい場合は削除の代わりに非表示運用をご検討ください。
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
              章を削除
            </Button>
          }
          title={`章「${props.chapterName}」を削除しますか？`}
          description="この操作は元に戻せません。章の配下にある子章やUNIT、問題も含めて完全に削除されます。"
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
        子章だけ残したい場合は、先に子章の構成を変更してから削除してください。
      </p>
    </div>
  );
}
