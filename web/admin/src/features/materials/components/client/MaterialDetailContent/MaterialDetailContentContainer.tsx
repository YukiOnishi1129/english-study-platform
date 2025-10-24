"use client";

import { useMaterialDetailQuery } from "@/features/materials/queries/useMaterialDetailQuery";
import { MaterialDetailContentPresenter } from "./MaterialDetailContentPresenter";

interface MaterialDetailContentProps {
  materialId: string;
}

export function MaterialDetailContent(props: MaterialDetailContentProps) {
  const { data, isLoading, isError } = useMaterialDetailQuery(props.materialId);

  return (
    <MaterialDetailContentPresenter
      materialId={props.materialId}
      detail={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
