"use client";

import { useChapterDetailQuery } from "@/features/chapters/queries/useChapterDetailQuery";
import { ChapterDetailContentPresenter } from "./ChapterDetailContentPresenter";

interface ChapterDetailContentProps {
  chapterId: string;
}

export function ChapterDetailContent(props: ChapterDetailContentProps) {
  const { chapterId } = props;
  const { data, isLoading, isError } = useChapterDetailQuery(chapterId);

  if (!data) {
    return null;
  }

  return (
    <ChapterDetailContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
