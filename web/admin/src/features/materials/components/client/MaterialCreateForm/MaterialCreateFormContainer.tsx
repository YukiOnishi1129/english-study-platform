"use client";

import { MaterialCreateFormPresenter } from "./MaterialCreateFormPresenter";
import { useMaterialCreateForm } from "./useMaterialCreateForm";

export function MaterialCreateForm() {
  const state = useMaterialCreateForm();
  return <MaterialCreateFormPresenter {...state} />;
}
