"use client";

import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";
import type { UnitDetailContentPresenterProps } from "./UnitDetailContentPresenter";
import { UnitDetailContentPresenter } from "./UnitDetailContentPresenter";

interface UnitDetailContentProps {
  unitId: string;
  onDeleteUnit: UnitDetailContentPresenterProps["onDeleteUnit"];
  onReorderQuestions: UnitDetailContentPresenterProps["onReorderQuestions"];
}

export function UnitDetailContent(props: UnitDetailContentProps) {
  const { unitId, onDeleteUnit, onReorderQuestions } = props;
  const { data, isLoading, isError } = useUnitDetailQuery(unitId);

  return (
    <UnitDetailContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
      onDeleteUnit={onDeleteUnit}
      onReorderQuestions={onReorderQuestions}
    />
  );
}
