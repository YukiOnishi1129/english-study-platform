"use client";

import type { FormState } from "@/features/materials/types/formState";
import { ChapterCreateFormPresenter } from "./ChapterCreateFormPresenter";
import { useChapterCreateForm } from "./useChapterCreateForm";

export interface ChapterCreateFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  materialId: string;
  parentChapterId?: string;
  parentChapterName?: string;
}

export function ChapterCreateForm(props: ChapterCreateFormProps) {
  const state = useChapterCreateForm(props);
  return <ChapterCreateFormPresenter {...state} />;
}
