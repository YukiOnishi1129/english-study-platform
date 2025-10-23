"use client";

import { useActionState } from "react";
import type { FormState } from "@/features/materials/types/formState";
import { initialFormState } from "@/features/materials/types/formState";

export function useMaterialCreateForm(
  action: (state: FormState, formData: FormData) => Promise<FormState>,
) {
  const [state, formAction] = useActionState(action, initialFormState);

  return { state, formAction };
}
