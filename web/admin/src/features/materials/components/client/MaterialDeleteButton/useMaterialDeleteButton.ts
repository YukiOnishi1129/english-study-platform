"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import type { MaterialDeleteButtonContainerProps } from "./MaterialDeleteButtonContainer";

interface UseMaterialDeleteButtonState {
  materialName: string;
  supportingText: string;
  isDialogOpen: boolean;
  isPending: boolean;
  errorMessage: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function useMaterialDeleteButton(
  props: MaterialDeleteButtonContainerProps,
): UseMaterialDeleteButtonState {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = useCallback(() => {
    if (isPending) {
      return;
    }

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
  }, [isPending, props, router]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setErrorMessage(null);
    }
    setIsDialogOpen(open);
  }, []);

  return {
    materialName: props.materialName,
    supportingText:
      "教材配下の章・UNIT・問題・正解がすべて削除されます。履歴を残したい場合は非表示運用をご検討ください。",
    isDialogOpen,
    isPending,
    errorMessage,
    onOpenChange: handleOpenChange,
    onConfirm: handleConfirm,
  };
}
