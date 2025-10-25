"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { materialKeys } from "@/features/materials/queries/keys";
import { deleteChapterAction } from "./actions";
import type { ChapterDeleteButtonContainerProps } from "./ChapterDeleteButtonContainer";

interface UseChapterDeleteButtonState {
  chapterName: string;
  supportingText: string;
  isDialogOpen: boolean;
  isPending: boolean;
  errorMessage: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function useChapterDeleteButton(
  props: ChapterDeleteButtonContainerProps,
): UseChapterDeleteButtonState {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await deleteChapterAction({
        chapterId: props.chapterId,
        materialId: props.materialId,
        parentChapterId: props.parentChapterId,
        ancestorChapterIds: props.ancestorChapterIds,
      });

      if (!result.success) {
        throw new Error(result.message ?? "章の削除に失敗しました。");
      }

      return result;
    },
    onSuccess: async (result) => {
      const invalidateTasks = [
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.materialId),
        }),
      ];

      props.ancestorChapterIds.forEach((ancestorId) => {
        invalidateTasks.push(
          queryClient.invalidateQueries({
            queryKey: chapterKeys.detail(ancestorId),
          }),
        );
      });

      invalidateTasks.push(
        queryClient.invalidateQueries({
          queryKey: chapterKeys.detail(props.chapterId),
        }),
      );

      await Promise.all(invalidateTasks);

      setIsDialogOpen(false);

      if (result.redirect) {
        router.push(result.redirect as Parameters<typeof router.push>[0]);
      }

      router.refresh();
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error ? error.message : "章の削除に失敗しました。",
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
    chapterName: props.chapterName,
    supportingText:
      "この章と配下にある子章・UNIT・問題・正解がすべて削除されます。履歴を残したい場合は削除の代わりに非表示運用をご検討ください。",
    isDialogOpen,
    isPending: mutation.isPending,
    errorMessage,
    onOpenChange: handleOpenChange,
    onConfirm: handleConfirm,
  };
}
