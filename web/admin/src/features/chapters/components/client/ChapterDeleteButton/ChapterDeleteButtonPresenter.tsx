import { Button } from "@/shared/components/ui/button";
import { DeleteConfirmDialog } from "@/shared/components/ui/delete-confirm-dialog";

export interface ChapterDeleteButtonPresenterProps {
  chapterName: string;
  supportingText: string;
  isDialogOpen: boolean;
  isPending: boolean;
  errorMessage: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ChapterDeleteButtonPresenter(
  props: ChapterDeleteButtonPresenterProps,
) {
  const {
    chapterName,
    supportingText,
    isDialogOpen,
    isPending,
    errorMessage,
    onOpenChange,
    onConfirm,
  } = props;

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-red-700">章を削除</h3>
          <p className="text-xs text-red-600">{supportingText}</p>
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
          title={`章「${chapterName}」を削除しますか？`}
          description="この操作は元に戻せません。章の配下にある子章やUNIT、問題も含めて完全に削除されます。"
          confirmLabel="削除する"
          confirmPendingLabel="削除中..."
          cancelLabel="キャンセル"
          isPending={isPending}
          errorMessage={errorMessage ?? undefined}
          open={isDialogOpen}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
        />
      </div>
      <p className="text-xs text-gray-600">
        子章だけ残したい場合は、先に子章の構成を変更してから削除してください。
      </p>
    </div>
  );
}
