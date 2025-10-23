"use client";

import { useChapterDetailQuery } from "@/features/chapters/queries/useChapterDetailQuery";
import type {
  FormRedirect,
  FormState,
} from "@/features/materials/types/formState";
import type { ReorderUnitsAction } from "@/features/materials/types/reorderUnitsAction";
import { ChapterDetailContentPresenter } from "./ChapterDetailContentPresenter";

interface ChapterDetailContentProps {
  chapterId: string;
  onCreateChapter: (state: FormState, formData: FormData) => Promise<FormState>;
  onCreateUnit: (state: FormState, formData: FormData) => Promise<FormState>;
  onReorderUnits: ReorderUnitsAction;
  onDeleteChapter: (payload: {
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

export function ChapterDetailContent(props: ChapterDetailContentProps) {
  const {
    chapterId,
    onCreateChapter,
    onCreateUnit,
    onReorderUnits,
    onDeleteChapter,
  } = props;
  const { data, isLoading, isError } = useChapterDetailQuery(chapterId);

  return (
    <ChapterDetailContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
      onCreateChapter={onCreateChapter}
      onCreateUnit={onCreateUnit}
      onReorderUnits={onReorderUnits}
      onDeleteChapter={onDeleteChapter}
    />
  );
}
