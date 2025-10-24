"use client";

import { useActionState } from "react";
import { initialFormState } from "@/features/materials/types/formState";
import type {
  UnitCreateFormPresenterProps,
  UnitCreateFormProps,
} from "./types";

export function useUnitCreateForm(
  props: UnitCreateFormProps,
): UnitCreateFormPresenterProps {
  const [state, formAction] = useActionState(props.action, initialFormState);

  return {
    state,
    formAction,
    chapterId: props.chapterId,
    chapterName: props.chapterName,
    materialId: props.materialId,
  } satisfies UnitCreateFormPresenterProps;
}
