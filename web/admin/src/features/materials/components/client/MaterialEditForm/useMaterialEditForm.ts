"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import type { FormState } from "@/features/materials/types/formState";
import { initialFormState } from "@/features/materials/types/formState";

export function useMaterialEditForm(
  action: (state: FormState, formData: FormData) => Promise<FormState>,
) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, initialFormState);

  useEffect(() => {
    if (state.status === "success" && state.redirect) {
      router.replace(state.redirect);
    }
  }, [state, router]);

  const wrappedFormAction = (formData: FormData) => {
    formAction(formData);
  };

  return {
    state,
    formAction: wrappedFormAction,
  };
}
