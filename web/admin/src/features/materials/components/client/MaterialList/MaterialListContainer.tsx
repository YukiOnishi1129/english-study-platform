"use client";

import { useMaterialsListQuery } from "@/features/materials/queries/useMaterialsListQuery";
import { MaterialListPresenter } from "./MaterialListPresenter";

export function MaterialList() {
  const { data, isLoading, isError } = useMaterialsListQuery();
  const materials = data ?? [];

  return (
    <MaterialListPresenter
      materials={materials}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
