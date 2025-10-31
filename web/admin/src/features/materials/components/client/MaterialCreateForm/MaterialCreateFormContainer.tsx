"use client";

import { useContentTypesQuery } from "@/features/materials/queries/useContentTypesQuery";
import { MaterialCreateFormPresenter } from "./MaterialCreateFormPresenter";
import { useMaterialCreateForm } from "./useMaterialCreateForm";

export function MaterialCreateForm() {
  const state = useMaterialCreateForm();
  const { data, isLoading, isError } = useContentTypesQuery();

  return (
    <MaterialCreateFormPresenter
      {...state}
      contentTypes={data ?? []}
      isLoadingContentTypes={isLoading}
      hasContentTypeError={isError}
    />
  );
}
