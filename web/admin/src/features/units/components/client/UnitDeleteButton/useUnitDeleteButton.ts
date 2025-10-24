"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toChapterDetailPath } from "@/features/materials/lib/paths";
import type { UnitDeleteButtonContainerProps } from "./UnitDeleteButtonContainer";

interface UseUnitDeleteButtonState {
  unitName: string;
  supportingText: string;
  isDialogOpen: boolean;
  isPending: boolean;
  errorMessage: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function useUnitDeleteButton(
  props: UnitDeleteButtonContainerProps,
): UseUnitDeleteButtonState {
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
        const result = await props.deleteUnitAction({
          unitId: props.unitId,
          chapterId: props.chapterId,
          materialId: props.materialId,
        });

        if (!result.success) {
          setErrorMessage(result.message ?? "UNITの削除に失敗しました。");
          return;
        }

        setIsDialogOpen(false);
        router.push(toChapterDetailPath(props.chapterId));
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "UNITの削除に失敗しました。",
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
    unitName: props.unitName,
    supportingText:
      "配下の問題・正解もすべて削除されます。履歴を保持したい場合は削除を行わず非表示の運用をご検討ください。",
    isDialogOpen,
    isPending,
    errorMessage,
    onOpenChange: handleOpenChange,
    onConfirm: handleConfirm,
  };
}
