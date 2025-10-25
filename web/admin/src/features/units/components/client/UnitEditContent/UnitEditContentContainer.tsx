"use client";

import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";
import { UnitEditContentPresenter } from "./UnitEditContentPresenter";

interface UnitEditContentProps {
  unitId: string;
}

export function UnitEditContent(props: UnitEditContentProps) {
  const { unitId } = props;
  const { data, isLoading, isError } = useUnitDetailQuery(unitId);

  return (
    <UnitEditContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
