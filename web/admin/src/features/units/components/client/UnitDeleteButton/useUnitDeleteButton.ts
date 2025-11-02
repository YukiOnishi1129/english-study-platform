"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { toChapterDetailPath } from "@/features/materials/lib/paths";
import { materialKeys } from "@/features/materials/queries/keys";
import { unitKeys } from "@/features/units/queries/keys";
import { deleteUnitAction } from "./actions";
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
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await deleteUnitAction({
        unitId: props.unitId,
        chapterId: props.chapterId,
        materialId: props.materialId,
      });

      if (!result.success) {
        throw new Error(result.message ?? "UNITの削除に失敗しました。");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: unitKeys.detail(props.unitId),
      });
      setIsDialogOpen(false);
      router.push(toChapterDetailPath(props.chapterId));
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.materialId),
        }),
        queryClient.invalidateQueries({
          queryKey: chapterKeys.detail(props.chapterId),
        }),
      ]).finally(() => {
        router.refresh();
      });
      toast.success(`UNIT「${props.unitName}」を削除しました。`, {
        description: "章の詳細にリダイレクトしました。",
      });
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error ? error.message : "UNITの削除に失敗しました。",
      );
    },
  });

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setErrorMessage(null);
    }
    setIsDialogOpen(open);
  }, []);

  const handleConfirm = useCallback(() => {
    setErrorMessage(null);
    mutation.mutate();
  }, [mutation]);

  return {
    unitName: props.unitName,
    supportingText:
      "配下の問題・正解もすべて削除されます。履歴を保持したい場合は削除を行わず非表示の運用をご検討ください。",
    isDialogOpen,
    isPending: mutation.isPending,
    errorMessage,
    onOpenChange: handleOpenChange,
    onConfirm: handleConfirm,
  };
}
