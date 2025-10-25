"use client";

import { ChapterCreateFormPresenter } from "./ChapterCreateFormPresenter";
import { useChapterCreateForm } from "./useChapterCreateForm";

interface ChapterCreateFormProps {
  materialId: string;
  parentChapterId?: string;
  parentChapterName?: string;
  invalidateChapterId?: string;
}

export function ChapterCreateForm(props: ChapterCreateFormProps) {
  const state = useChapterCreateForm(props);
  return <ChapterCreateFormPresenter {...state} />;
}
