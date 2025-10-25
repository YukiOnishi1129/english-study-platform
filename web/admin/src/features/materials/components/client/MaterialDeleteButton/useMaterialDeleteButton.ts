"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { materialKeys } from "@/features/materials/queries/keys";
import { deleteMaterialAction } from "./actions";
import type { MaterialDeleteButtonProps } from "./types";

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
  props: MaterialDeleteButtonProps,
): UseMaterialDeleteButtonState {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await deleteMaterialAction({
        materialId: props.materialId,
      });

      if (!result.success) {
        throw new Error(result.message ?? "教材の削除に失敗しました。");
      }

      return result;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: materialKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.materialId),
        }),
      ]);
      setIsDialogOpen(false);
      router.push("/materials");
      router.refresh();
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error ? error.message : "教材の削除に失敗しました。",
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
    if (mutation.isPending) {
      return;
    }

    setErrorMessage(null);
    mutation.mutate();
  }, [mutation]);

  return {
    materialName: props.materialName,
    supportingText:
      "教材配下の章・UNIT・問題・正解がすべて削除されます。履歴を残したい場合は非表示運用をご検討ください。",
    isDialogOpen,
    isPending: mutation.isPending,
    errorMessage,
    onOpenChange: handleOpenChange,
    onConfirm: handleConfirm,
  } satisfies UseMaterialDeleteButtonState;
}
