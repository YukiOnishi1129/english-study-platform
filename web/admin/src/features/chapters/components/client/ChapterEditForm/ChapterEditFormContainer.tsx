"use client";

import { ChapterEditFormPresenter } from "./ChapterEditFormPresenter";
import type { ChapterEditFormProps } from "./types";
import { useChapterEditForm } from "./useChapterEditForm";

export function ChapterEditForm(props: ChapterEditFormProps) {
  const state = useChapterEditForm(props);
  return <ChapterEditFormPresenter {...state} />;
}
