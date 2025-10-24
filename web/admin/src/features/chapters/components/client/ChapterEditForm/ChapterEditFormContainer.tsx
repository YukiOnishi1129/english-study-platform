"use client";

import type { FormState } from "@/features/materials/types/formState";
import { ChapterEditFormPresenter } from "./ChapterEditFormPresenter";
import { useChapterEditForm } from "./useChapterEditForm";

export interface ChapterEditFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues: {
    chapterId: string;
    materialId: string;
    parentChapterId: string | null;
    name: string;
    description: string | null;
  };
}

export function ChapterEditForm(props: ChapterEditFormProps) {
  const state = useChapterEditForm(props);
  return <ChapterEditFormPresenter {...state} />;
}
