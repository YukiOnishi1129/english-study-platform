"use client";

import type { FormState } from "@/features/materials/types/formState";
import { MaterialEditFormPresenter } from "./MaterialEditFormPresenter";
import { useMaterialEditForm } from "./useMaterialEditForm";

interface MaterialEditFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues: {
    materialId: string;
    name: string;
    description: string | null;
  };
}

export function MaterialEditForm(props: MaterialEditFormProps) {
  const state = useMaterialEditForm(props.action);

  return (
    <MaterialEditFormPresenter
      defaultValues={props.defaultValues}
      formAction={state.formAction}
      state={state.state}
    />
  );
}
