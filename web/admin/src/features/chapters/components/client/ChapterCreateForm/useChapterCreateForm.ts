"use client";

import { useActionState, useMemo } from "react";
import {
  type FormState,
  initialFormState,
} from "@/features/materials/types/formState";
import type { ChapterCreateFormProps } from "./ChapterCreateFormContainer";

export interface UseChapterCreateFormResult {
  materialId: string;
  parentChapterId?: string;
  parentChapterName?: string;
  contextLabel: string;
  state: FormState;
  formAction: (formData: FormData) => void;
}

export function useChapterCreateForm(
  props: ChapterCreateFormProps,
): UseChapterCreateFormResult {
  const [state, formAction] = useActionState(props.action, initialFormState);

  const contextLabel = useMemo(() => {
    if (props.parentChapterId && props.parentChapterName) {
      return `「${props.parentChapterName}」の下に章を追加`;
    }
    return "新しい章を追加";
  }, [props.parentChapterId, props.parentChapterName]);

  return {
    materialId: props.materialId,
    parentChapterId: props.parentChapterId,
    parentChapterName: props.parentChapterName,
    contextLabel,
    state,
    formAction,
  } satisfies UseChapterCreateFormResult;
}
