"use client";

import { UnitDeleteButtonPresenter } from "./UnitDeleteButtonPresenter";
import { useUnitDeleteButton } from "./useUnitDeleteButton";

export interface UnitDeleteButtonContainerProps {
  unitId: string;
  unitName: string;
  chapterId: string;
  materialId: string;
}

export function UnitDeleteButton(props: UnitDeleteButtonContainerProps) {
  const state = useUnitDeleteButton(props);

  return (
    <UnitDeleteButtonPresenter
      unitName={state.unitName}
      supportingText={state.supportingText}
      isDialogOpen={state.isDialogOpen}
      isPending={state.isPending}
      errorMessage={state.errorMessage}
      onOpenChange={state.onOpenChange}
      onConfirm={state.onConfirm}
    />
  );
}
