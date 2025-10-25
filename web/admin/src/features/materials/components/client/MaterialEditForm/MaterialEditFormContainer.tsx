"use client";

import { MaterialEditFormPresenter } from "./MaterialEditFormPresenter";
import type { MaterialEditFormProps } from "./types";
import { useMaterialEditForm } from "./useMaterialEditForm";

export function MaterialEditForm(props: MaterialEditFormProps) {
  const state = useMaterialEditForm(props);
  return <MaterialEditFormPresenter {...state} />;
}
