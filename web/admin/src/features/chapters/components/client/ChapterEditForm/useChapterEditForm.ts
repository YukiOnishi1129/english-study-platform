"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  type FormState,
  initialFormState,
} from "@/features/materials/types/formState";
import type { ChapterEditFormProps } from "./ChapterEditFormContainer";

export interface UseChapterEditFormResult {
  state: FormState;
  formAction: (formData: FormData) => void;
  defaultValues: ChapterEditFormProps["defaultValues"];
}

export function useChapterEditForm(
  props: ChapterEditFormProps,
): UseChapterEditFormResult {
  const router = useRouter();
  const [state, formAction] = useActionState(props.action, initialFormState);

  useEffect(() => {
    if (state.status === "success" && state.redirect) {
      router.replace(state.redirect);
    }
  }, [router, state]);

  return {
    state,
    formAction,
    defaultValues: props.defaultValues,
  } satisfies UseChapterEditFormResult;
}
