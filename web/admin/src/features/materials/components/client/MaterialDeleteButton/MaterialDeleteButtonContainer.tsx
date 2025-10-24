"use client";

import { MaterialDeleteButtonPresenter } from "./MaterialDeleteButtonPresenter";
import type { MaterialDeleteButtonProps } from "./types";
import { useMaterialDeleteButton } from "./useMaterialDeleteButton";

export function MaterialDeleteButton(props: MaterialDeleteButtonProps) {
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
