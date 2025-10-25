"use client";

import { useChapterDetailQuery } from "@/features/chapters/queries/useChapterDetailQuery";
import { ChapterEditContentPresenter } from "./ChapterEditContentPresenter";

interface ChapterEditContentProps {
  chapterId: string;
}

export function ChapterEditContent(props: ChapterEditContentProps) {
  const { chapterId } = props;
  const { data, isLoading, isError } = useChapterDetailQuery(chapterId);

  return (
    <ChapterEditContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
