"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
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
  }, [isPending, props, router]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setErrorMessage(null);
    }
    setIsDialogOpen(open);
  }, []);

  return {
    chapterName: props.chapterName,
    supportingText:
      "この章と配下にある子章・UNIT・問題・正解がすべて削除されます。履歴を残したい場合は削除の代わりに非表示運用をご検討ください。",
    isDialogOpen,
    isPending,
    errorMessage,
    onOpenChange: handleOpenChange,
    onConfirm: handleConfirm,
  };
}
