"use client";

import type { UnitEditFormProps } from "./types";
import { UnitEditFormPresenter } from "./UnitEditFormPresenter";
import { useUnitEditForm } from "./useUnitEditForm";

export function UnitEditForm(props: UnitEditFormProps) {
  const state = useUnitEditForm(props);
  return <UnitEditFormPresenter {...state} />;
}
