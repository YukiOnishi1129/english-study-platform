"use client";

import type { UnitCreateFormProps } from "./types";
import { UnitCreateFormPresenter } from "./UnitCreateFormPresenter";
import { useUnitCreateForm } from "./useUnitCreateForm";

export function UnitCreateForm(props: UnitCreateFormProps) {
  const state = useUnitCreateForm(props);
  return <UnitCreateFormPresenter {...state} />;
}
