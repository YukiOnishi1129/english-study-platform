import { Button } from "@/shared/components/ui/button";
import { DeleteConfirmDialog } from "@/shared/components/ui/delete-confirm-dialog";

export interface UnitDeleteButtonPresenterProps {
  unitName: string;
  supportingText: string;
  isDialogOpen: boolean;
  isPending: boolean;
  errorMessage: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function UnitDeleteButtonPresenter(
  props: UnitDeleteButtonPresenterProps,
) {
  const {
    unitName,
    supportingText,
    isDialogOpen,
    isPending,
    errorMessage,
    onOpenChange,
    onConfirm,
  } = props;

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-red-700">UNITを削除</h3>
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
              UNITを削除
            </Button>
          }
          title={`UNIT「${unitName}」を削除しますか？`}
          description="この操作は元に戻せません。UNIT配下の問題と正解もすべて削除されます。"
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
        UNITを残したまま問題を削除したい場合は、問題詳細の削除機能をご利用ください。
      </p>
    </div>
  );
}
