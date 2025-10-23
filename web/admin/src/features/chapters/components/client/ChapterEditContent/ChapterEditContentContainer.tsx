"use client";

import { useChapterDetailQuery } from "@/features/chapters/queries/useChapterDetailQuery";
import type { FormState } from "@/features/materials/types/formState";
import { ChapterEditContentPresenter } from "./ChapterEditContentPresenter";

interface ChapterEditContentProps {
  chapterId: string;
  onSubmit: (state: FormState, formData: FormData) => Promise<FormState>;
}

export function ChapterEditContent(props: ChapterEditContentProps) {
  const { chapterId, onSubmit } = props;
  const { data, isLoading, isError } = useChapterDetailQuery(chapterId);

  return (
    <ChapterEditContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
      onSubmit={onSubmit}
    />
  );
}
