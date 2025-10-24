"use client";

import { ChapterDeleteButtonPresenter } from "./ChapterDeleteButtonPresenter";
import { useChapterDeleteButton } from "./useChapterDeleteButton";

export interface ChapterDeleteButtonContainerProps {
  chapterId: string;
  chapterName: string;
  materialId: string;
  parentChapterId: string | null;
  ancestorChapterIds: string[];
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
