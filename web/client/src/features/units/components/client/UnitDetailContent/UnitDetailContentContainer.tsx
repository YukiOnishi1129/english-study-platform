"use client";

import { UnitDetailContentPresenter } from "./UnitDetailContentPresenter";
import { useUnitDetailContent } from "./useUnitDetailContent";

interface UnitDetailContentProps {
  unitId: string;
}

export function UnitDetailContent(props: UnitDetailContentProps) {
  const viewModel = useUnitDetailContent({ unitId: props.unitId });
  return <UnitDetailContentPresenter {...viewModel} />;
}
