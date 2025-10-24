"use client";

import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";
import { UnitDetailContentPresenter } from "./UnitDetailContentPresenter";

interface UnitDetailContentProps {
  unitId: string;
}

export function UnitDetailContent(props: UnitDetailContentProps) {
  const { unitId } = props;
  const { data, isLoading, isError } = useUnitDetailQuery(unitId);

  return (
    <UnitDetailContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
