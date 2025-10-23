"use client";

import type { FormState } from "@/features/materials/types/formState";
import { MaterialCreateFormPresenter } from "./MaterialCreateFormPresenter";
import { useMaterialCreateForm } from "./useMaterialCreateForm";

interface MaterialCreateFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

export function MaterialCreateForm(props: MaterialCreateFormProps) {
  const state = useMaterialCreateForm(props.action);

  return (
    <MaterialCreateFormPresenter
      formAction={state.formAction}
      state={state.state}
    />
  );
}
