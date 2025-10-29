"use client";

import { UnitDetailContentPresenter } from "./UnitDetailContentPresenter";
import { useUnitDetailContent } from "./useUnitDetailContent";

interface UnitDetailContentProps {
  unitId: string;
  accountId: string | null;
}

export function UnitDetailContent(props: UnitDetailContentProps) {
  const viewModel = useUnitDetailContent({
    unitId: props.unitId,
    accountId: props.accountId,
  });
  return <UnitDetailContentPresenter {...viewModel} />;
}
