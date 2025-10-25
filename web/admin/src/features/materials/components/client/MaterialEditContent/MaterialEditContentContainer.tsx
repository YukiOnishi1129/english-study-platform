"use client";

import { useMaterialDetailQuery } from "@/features/materials/queries/useMaterialDetailQuery";
import { MaterialEditContentPresenter } from "./MaterialEditContentPresenter";

interface MaterialEditContentProps {
  materialId: string;
}

export function MaterialEditContent(props: MaterialEditContentProps) {
  const { data, isLoading, isError } = useMaterialDetailQuery(props.materialId);

  return (
    <MaterialEditContentPresenter
      materialId={props.materialId}
      detail={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
