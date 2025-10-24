"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { initialFormState } from "@/features/materials/types/formState";
import type { UnitEditFormPresenterProps, UnitEditFormProps } from "./types";

export function useUnitEditForm(
  props: UnitEditFormProps,
): UnitEditFormPresenterProps {
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
  } satisfies UnitEditFormPresenterProps;
}
