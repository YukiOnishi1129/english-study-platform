"use client";

import { MaterialDeleteButtonPresenter } from "./MaterialDeleteButtonPresenter";
import { useMaterialDeleteButton } from "./useMaterialDeleteButton";

export interface MaterialDeleteButtonContainerProps {
  materialId: string;
  materialName: string;
  deleteMaterialAction: (payload: {
    materialId: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

export function MaterialDeleteButton(
  props: MaterialDeleteButtonContainerProps,
) {
  const state = useMaterialDeleteButton(props);

  return (
    <MaterialDeleteButtonPresenter
      materialName={state.materialName}
      isDialogOpen={state.isDialogOpen}
      isPending={state.isPending}
      errorMessage={state.errorMessage}
      supportingText={state.supportingText}
      onOpenChange={state.onOpenChange}
      onConfirm={state.onConfirm}
    />
  );
}
