"use client";

import { ChapterDeleteButtonPresenter } from "./ChapterDeleteButtonPresenter";
import { useChapterDeleteButton } from "./useChapterDeleteButton";
import type { FormRedirect } from "@/features/materials/types/formState";

export interface ChapterDeleteButtonContainerProps {
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

export function ChapterDeleteButton(props: ChapterDeleteButtonContainerProps) {
  const state = useChapterDeleteButton(props);

  return (
    <ChapterDeleteButtonPresenter
      chapterName={state.chapterName}
      supportingText={state.supportingText}
      isDialogOpen={state.isDialogOpen}
      isPending={state.isPending}
      errorMessage={state.errorMessage}
      onOpenChange={state.onOpenChange}
      onConfirm={state.onConfirm}
    />
  );
}
